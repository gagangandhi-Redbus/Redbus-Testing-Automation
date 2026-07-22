import { test, expect } from '@playwright/test';

test('RedBus SG - Dynamic Search Flow', async ({ page }) => {

  test.setTimeout(180000);

  // ==========================================
  // 1. OPEN REDBUS SG
  // ==========================================

  await page.goto('https://www.redbus.sg/', {
    waitUntil: 'domcontentloaded'
  });

  await expect(
    page.getByText(/Book bus tickets online in Singapore/i)
  ).toBeVisible();

  console.log('✅ SG Homepage loaded');


  // ==========================================
  // 2. SELECT SOURCE
  // ==========================================

  console.log('Selecting Source...');

  // Click From field
  await page.getByText('From', { exact: true }).first().click();

  await page.waitForTimeout(1000);

  /*
    Find visible options/buttons after opening From.
    We avoid hardcoding city name.
  */

  const sourceOptions = page.locator(
    '[role="option"]:visible, [role="button"]:visible'
  );

  const sourceCount = await sourceOptions.count();

  console.log(`Found ${sourceCount} possible source options`);

  let sourceSelected = false;

  for (let i = 0; i < sourceCount; i++) {

    const option = sourceOptions.nth(i);

    const text = (await option.innerText().catch(() => '')).trim();

    // Ignore buttons which clearly aren't locations
    if (
      text &&
      !/search buses|download|account|help|booking|close/i.test(text)
    ) {

      console.log(`Trying source: ${text}`);

      await option.click();

      sourceSelected = true;

      console.log(`✅ Source selected: ${text}`);

      break;
    }
  }

  if (!sourceSelected) {
    throw new Error('❌ Could not find a valid Source');
  }


  // ==========================================
  // 3. SELECT DESTINATION
  // ==========================================

  console.log('Selecting Destination...');

  await page.getByText('To', { exact: true }).first().click();

  await page.waitForTimeout(1000);

  const destinationOptions = page.locator(
    '[role="option"]:visible, [role="button"]:visible'
  );

  const destinationCount = await destinationOptions.count();

  console.log(
    `Found ${destinationCount} possible destination options`
  );

  let destinationSelected = false;

  for (let i = 0; i < destinationCount; i++) {

    const option = destinationOptions.nth(i);

    const text = (await option.innerText().catch(() => '')).trim();

    if (
      text &&
      !/search buses|download|account|help|booking|close/i.test(text)
    ) {

      console.log(`Trying destination: ${text}`);

      await option.click();

      destinationSelected = true;

      console.log(`✅ Destination selected: ${text}`);

      break;
    }
  }

  if (!destinationSelected) {
    throw new Error('❌ Could not find a valid Destination');
  }


  // ==========================================
  // 4. SELECT TOMORROW
  // ==========================================

  console.log('Selecting tomorrow date...');

  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowDay = tomorrow.getDate();

  console.log(`Tomorrow date is: ${tomorrowDay}`);

  // Open Date of Journey
  await page.getByText(/Date of journey/i).first().click();

  await page.waitForTimeout(500);

  /*
    Try accessible calendar label first.
  */

  const tomorrowDate = page.getByRole('button', {
    name: new RegExp(`\\b${tomorrowDay}\\b`)
  }).first();

  if (await tomorrowDate.isVisible().catch(() => false)) {

    await tomorrowDate.click();

    console.log('✅ Tomorrow date selected');

  } else {

    console.log(
      '⚠️ Tomorrow locator not found - trying Today/Tomorrow button'
    );

    const tomorrowButton = page.getByText(
      'Tomorrow',
      { exact: true }
    );

    if (await tomorrowButton.isVisible().catch(() => false)) {

      await tomorrowButton.click();

      console.log('✅ Tomorrow selected');

    } else {

      console.log(
        '⚠️ Could not select date - continuing with existing/default date'
      );

      // Close calendar if required
      await page.keyboard.press('Escape').catch(() => {});
    }
  }


  // ==========================================
  // 5. SEARCH BUSES
  // ==========================================

  console.log('Searching buses...');

  const searchButton = page.getByRole('button', {
    name: /Search buses/i
  });

  await expect(searchButton).toBeVisible();

  await searchButton.click();

  console.log('✅ Search buses clicked');


  // ==========================================
  // 6. VERIFY SEARCH RESULTS
  // ==========================================

  await page.waitForLoadState('domcontentloaded');

  console.log('Current URL:', page.url());

  await expect(page).toHaveURL(/search/i, {
    timeout: 30000
  });

  console.log('🎉 SG SEARCH FLOW COMPLETED SUCCESSFULLY');

});