import { test, expect } from '@playwright/test';
import * as readline from 'readline';

type PlaceOption = {
  number: number;
  displayName: string;
  locatorName: RegExp;
};

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function chooseOption(
  title: string,
  options: PlaceOption[],
  envKey: string
): Promise<PlaceOption> {
  console.log('\n==============================');
  console.log(`       ${title}`);
  console.log('==============================');

  options.forEach((option) => {
    console.log(`${option.number}. ${option.displayName}`);
  });

  const fromEnv = process.env[envKey];
  const input =
    fromEnv && fromEnv.trim() !== ''
      ? fromEnv.trim()
      : await askQuestion(`\nEnter ${title} Number: `);

  const selected = options.find(
    (option) => option.number === Number(input)
  );

  if (!selected) {
    throw new Error(`❌ Invalid ${title.toLowerCase()} number: ${input}`);
  }

  console.log(`✅ Selected ${title}: ${selected.displayName}`);
  return selected;
}

function journeyDateLabel24HoursLater(): string {
  const journeyDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return journeyDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

test('RedBus India - Choose source/destination, +24h date, Male', async ({
  page,
}) => {
  test.setTimeout(300000);

  // ==================================================
  // 1) CHOOSE SOURCE & DESTINATION
  // ==================================================

  const sources: PlaceOption[] = [
    {
      number: 1,
      displayName: 'Anand Vihar',
      locatorName: /Anand Vihar, Delhi/i,
    },
    {
      number: 2,
      displayName: 'Kashmiri Gate',
      locatorName: /Kashmiri Gate/i,
    },
  ];

  const destinations: PlaceOption[] = [
    {
      number: 1,
      displayName: 'Dehradun',
      locatorName: /Dehradun/i,
    },
    {
      number: 2,
      displayName: 'Lucknow',
      locatorName: /Lucknow/i,
    },
    {
      number: 3,
      displayName: 'Jaipur (Rajasthan)',
      locatorName: /Jaipur/i,
    },
    {
      number: 4,
      displayName: 'Gorakhpur (uttar pradesh)',
      locatorName: /Gorakhpur/i,
    },
    {
      number: 5,
      displayName: 'Chandigarh',
      locatorName: /Chandigarh/i,
    },
    {
      number: 6,
      displayName: 'Rishikesh',
      locatorName: /Rishikesh/i,
    },
  ];

  const selectedSource = await chooseOption(
    'SOURCE',
    sources,
    'SOURCE_OPTION'
  );
  const selectedDestination = await chooseOption(
    'DESTINATION',
    destinations,
    'DEST_OPTION'
  );

  // Date is computed only after source & destination are chosen (+24 hours)
  const journeyLabel = journeyDateLabel24HoursLater();
  console.log(`📅 Journey date (+24h): ${journeyLabel}`);

  // ==================================================
  // 2) OPEN REDBUS
  // ==================================================

  await page.goto('https://www.redbus.in/');
  await expect(page).toHaveTitle(/redBus/i);
  console.log('✅ Opened RedBus successfully');

  // ==================================================
  // 3) SELECT SOURCE
  // ==================================================

  await page.locator('div').filter({ hasText: /^From$/ }).nth(1).click();
  await page
    .getByRole('button', { name: selectedSource.locatorName })
    .first()
    .click();
  console.log(`✅ Source selected: ${selectedSource.displayName}`);

  // ==================================================
  // 4) SELECT DESTINATION
  // ==================================================

  await page.getByRole('combobox', { name: 'To' }).click();
  await page
    .getByRole('button', { name: selectedDestination.locatorName })
    .first()
    .click();
  console.log(
    `✅ Destination selected: ${selectedDestination.displayName}`
  );

  // ==================================================
  // 5) SELECT DATE (+24 HOURS)
  // ==================================================

  const dateDialog = page.getByRole('dialog', {
    name: /Select date of journey/i,
  });
  await expect(dateDialog).toBeVisible();

  await dateDialog
    .getByRole('button', {
      name: new RegExp(journeyLabel, 'i'),
    })
    .click();
  console.log(`✅ Date selected: ${journeyLabel}`);

  // ==================================================
  // 6) SEARCH BUSES
  // ==================================================

  await page
    .getByRole('button', { name: /Search buses/i })
    .first()
    .click();
  console.log('✅ Search buses clicked');

  await expect(page).toHaveURL(/search/, { timeout: 30000 });

  // ==================================================
  // 7) OPEN FIRST AVAILABLE BUS
  // ==================================================

  const firstBus = page.getByRole('button', { name: /View seats/i }).first();
  await expect(firstBus).toBeVisible({ timeout: 30000 });
  await firstBus.click();
  console.log('✅ First available bus opened');

  // ==================================================
  // 8) SELECT FIRST AVAILABLE SEAT
  // ==================================================

  const firstAvailableSeat = page
    .locator('div[role="button"][aria-label*="availability available"]')
    .first();
  await expect(firstAvailableSeat).toBeVisible({ timeout: 20000 });
  await firstAvailableSeat.click();
  console.log('✅ First available seat selected');

  // ==================================================
  // 9) BOARDING & DROPPING (first available points)
  // ==================================================

  await page.getByLabel(/Select boarding & dropping/i).click();
  console.log('✅ Boarding/Dropping page opened');

  const bpdpLists = page.locator('#bpdp-list');
  await expect(bpdpLists).toHaveCount(2, { timeout: 10000 });

  const firstBoarding = bpdpLists.nth(0).locator('[role="radio"]').first();
  await expect(firstBoarding).toBeVisible();
  if ((await firstBoarding.getAttribute('aria-checked')) !== 'true') {
    await firstBoarding.click();
  }
  console.log('✅ First boarding point selected');

  const firstDropping = bpdpLists.nth(1).locator('[role="radio"]').first();
  await expect(firstDropping).toBeVisible();
  if ((await firstDropping.getAttribute('aria-checked')) !== 'true') {
    await firstDropping.click();
  }
  console.log('✅ First dropping point selected');

  // ==================================================
  // 10) PASSENGER DETAILS
  // ==================================================

  await page.getByLabel('Phone *').fill('9911679155');
  console.log('✅ Phone entered');

  await page
    .getByPlaceholder('Enter email id')
    .fill('gagangandhi4080@gmail.com');
  console.log('✅ Email entered');

  await page.getByLabel('State of Residence *').click();
  await page.locator('text=Delhi').last().click();
  console.log('✅ State selected');

  await page.getByRole('textbox', { name: 'Name *' }).fill('Gagan');
  console.log('✅ Name entered');

  await page.getByRole('spinbutton', { name: 'Age *' }).fill('23');
  console.log('✅ Age entered');

  // Always select Male (exact match so Female is not matched)
  await page.getByRole('radio', { name: /^Male\b/i }).click();
  console.log('✅ Gender selected: Male');

  // ==================================================
  // 11) DON'T ADD INSURANCE (click at most once)
  // ==================================================

  const noInsurance = page.getByRole('radio', {
    name: /Don.?t add redBus Assurance/i,
  });

  if (await noInsurance.isVisible()) {
    const insuranceChecked = await noInsurance.getAttribute('aria-checked');
    if (insuranceChecked !== 'true') {
      await noInsurance.click();
      console.log("✅ Don't add insurance selected (single click)");
    } else {
      console.log("✅ Don't add insurance already selected (no extra click)");
    }
  }

  // ==================================================
  // 12) CONTINUE BOOKING → PAYMENT
  // ==================================================

  await page.getByRole('button', { name: /Continue booking/i }).click();
  console.log('✅ Continue booking clicked');

  await expect(
    page.getByText(/Payment|Credit\/Debit Card/i).first()
  ).toBeVisible({ timeout: 30000 });

  await page.screenshot({
    path: 'screenshots/india-testing-payment-page.png',
    fullPage: true,
  });

  console.log('🎉 PAYMENT PAGE REACHED SUCCESSFULLY');
});
