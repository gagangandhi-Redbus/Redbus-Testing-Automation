import { test, expect } from '@playwright/test';
import * as readline from 'readline';

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

test('RedBus - Dynamic Booking Flow', async ({ page }) => {

  test.setTimeout(300000);

  // ==================================================
  // SOURCE OPTIONS
  // ==================================================

  const sources = [
    {
      number: 1,
      displayName: 'Anand Vihar',
      locatorName: /Anand Vihar, Delhi/i
    },
    {
      number: 2,
      displayName: 'Kashmiri Gate',
      locatorName: /Kashmiri Gate/i
    }
  ];

  console.log('\n==============================');
  console.log('       SELECT SOURCE');
  console.log('==============================');

  sources.forEach(source => {
    console.log(`${source.number}. ${source.displayName}`);
  });

  const sourceInput = await askQuestion(
    '\nEnter Source Number: '
  );

  const selectedSource = sources.find(
    source => source.number === Number(sourceInput)
  );

  if (!selectedSource) {
    throw new Error(`❌ Invalid source number: ${sourceInput}`);
  }

  console.log(
    `✅ Selected Source: ${selectedSource.displayName}`
  );


  // ==================================================
  // DESTINATION OPTIONS
  // ==================================================

  const destinations = [
    {
      number: 1,
      displayName: 'Dehradun',
      locatorName: /Dehradun/i
    },
    {
      number: 2,
      displayName: 'Lucknow',
      locatorName: /Lucknow/i
    },
    {
      number: 3,
      displayName: 'Jaipur (Rajasthan)',
      locatorName: /Jaipur/i
    },
    {
      number: 4,
      displayName: 'Gorakhpur (uttar pradesh)',
      locatorName: /Gorakhpur/i
    },
    {
      number: 5,
      displayName: 'Chandigarh',
      locatorName: /Chandigarh/i
    },
    {
      number: 6,
      displayName: 'Rishikesh',
      locatorName: /Rishikesh/i
    }
  ];

  console.log('\n==============================');
  console.log('     SELECT DESTINATION');
  console.log('==============================');

  destinations.forEach(destination => {
    console.log(
      `${destination.number}. ${destination.displayName}`
    );
  });

  const destinationInput = await askQuestion(
    '\nEnter Destination Number: '
  );

  const selectedDestination = destinations.find(
    destination =>
      destination.number === Number(destinationInput)
  );

  if (!selectedDestination) {
    throw new Error(
      `❌ Invalid destination number: ${destinationInput}`
    );
  }

  console.log(
    `✅ Selected Destination: ${selectedDestination.displayName}`
  );


  // ==================================================
  // OPEN REDBUS
  // ==================================================

  await page.goto('https://www.redbus.in/');

  await expect(page).toHaveTitle(/redBus/i);

  console.log('✅ Opened RedBus successfully');


  // ==================================================
  // SELECT SOURCE
  // ==================================================

  console.log(
    `Selecting Source: ${selectedSource.displayName}`
  );

  await page
    .locator('div')
    .filter({ hasText: /^From$/ })
    .nth(1)
    .click();

  await page
    .getByRole('button', {
      name: selectedSource.locatorName
    })
    .first()
    .click();

  console.log(
    `✅ Source selected: ${selectedSource.displayName}`
  );


  // ==================================================
  // SELECT DESTINATION
  // ==================================================

  console.log(
    `Selecting Destination: ${selectedDestination.displayName}`
  );

  await page
    .getByRole('combobox', { name: 'To' })
    .click();

  await page
    .getByRole('button', {
      name: selectedDestination.locatorName
    })
    .first()
    .click();

  console.log(
    `✅ Destination selected: ${selectedDestination.displayName}`
  );


  // ==================================================
  // SELECT TOMORROW'S DATE
  // ==================================================

  console.log('Selecting tomorrow journey date...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowLabel = tomorrow.toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }
  );

  console.log(`Journey Date: ${tomorrowLabel}`);

  const dateDialog = page.getByRole('dialog', {
    name: /Select date of journey/i
  });

  await expect(dateDialog).toBeVisible();

  await dateDialog
    .getByRole('button', {
      name: new RegExp(tomorrowLabel, 'i')
    })
    .click();

  console.log(
    `✅ Date selected successfully: ${tomorrowLabel}`
  );


  // ==================================================
  // SEARCH BUSES
  // ==================================================

  await page
    .getByRole('button', {
      name: /Search buses/i
    })
    .first()
    .click();

  console.log('✅ Search buses clicked');

  await expect(page).toHaveURL(/search/, {
    timeout: 30000
  });


  // ==================================================
  // OPEN FIRST AVAILABLE BUS
  // ==================================================

  console.log('Opening first available bus...');

  const firstBus = page
    .getByRole('button', {
      name: /View seats/i
    })
    .first();

  await expect(firstBus).toBeVisible({
    timeout: 30000
  });

  await firstBus.click();

  console.log('✅ First available bus opened');


  // ==================================================
  // SELECT FIRST AVAILABLE SEAT
  // ==================================================

  const firstAvailableSeat = page
    .locator(
      'div[role="button"][aria-label*="availability available"]'
    )
    .first();

  await expect(firstAvailableSeat).toBeVisible({
    timeout: 20000
  });

  await firstAvailableSeat.click();

  console.log('✅ First available seat selected');


  // ==================================================
  // BOARDING & DROPPING
  // ==================================================

  await page
    .getByLabel(/Select boarding & dropping/i)
    .click();

  console.log('✅ Boarding/Dropping page opened');


  // First list = Boarding
  // Second list = Dropping

  const bpdpLists = page.locator('#bpdp-list');

  await expect(bpdpLists).toHaveCount(2, {
    timeout: 10000
  });


  // FIRST BOARDING POINT

  const firstBoarding = bpdpLists
    .nth(0)
    .locator('[role="radio"]')
    .first();

  await expect(firstBoarding).toBeVisible();

  // Sometimes first point is auto-selected
  const boardingChecked =
    await firstBoarding.getAttribute('aria-checked');

  if (boardingChecked !== 'true') {
    await firstBoarding.click();
  }

  console.log('✅ First boarding point selected');


  // FIRST DROPPING POINT

  const firstDropping = bpdpLists
    .nth(1)
    .locator('[role="radio"]')
    .first();

  await expect(firstDropping).toBeVisible();

  const droppingChecked =
    await firstDropping.getAttribute('aria-checked');

  if (droppingChecked !== 'true') {
    await firstDropping.click();
  }

  console.log('✅ First dropping point selected');


  // ==================================================
  // PASSENGER DETAILS
  // ==================================================

  await page
    .getByLabel('Phone *')
    .fill('9911679155');

  console.log('✅ Phone entered');

  await page
    .getByPlaceholder('Enter email id')
    .fill('gagangandhi4080@gmail.com');

  console.log('✅ Email entered');

  await page
    .getByLabel('State of Residence *')
    .click();

  await page
    .locator('text=Delhi')
    .last()
    .click();

  console.log('✅ State selected');

  await page
    .getByRole('textbox', {
      name: 'Name *'
    })
    .fill('Gagan');

  console.log('✅ Name entered');

  await page
    .getByRole('spinbutton', {
      name: 'Age *'
    })
    .fill('23');

  console.log('✅ Age entered');


  // ==================================================
  // SELECT MALE
  // Exact match important because /Male/i matches Female too
  // ==================================================

  await page
    .getByRole('radio', {
      name: /^Male\b/i
    })
    .click();

  console.log('✅ Gender selected: Male');


  // ==================================================
  // DON'T ADD INSURANCE
  // ==================================================

  const noInsurance = page.getByRole('radio', {
    name: /Don.?t add redBus Assurance/i
  });

  if (await noInsurance.isVisible()) {

    const insuranceChecked =
      await noInsurance.getAttribute('aria-checked');

    if (insuranceChecked !== 'true') {
      await noInsurance.click();
    }

    console.log('✅ Don’t add insurance selected');
  }


  // ==================================================
  // CONTINUE BOOKING
  // ==================================================

  await page
    .getByRole('button', {
      name: /Continue booking/i
    })
    .click();

  console.log('✅ Continue booking clicked');


  // ==================================================
  // VERIFY PAYMENT PAGE
  // ==================================================

  await expect(
    page.getByText(
      /Payment|Credit\/Debit Card/i
    ).first()
  ).toBeVisible({
    timeout: 30000
  });

  console.log('🎉 PAYMENT PAGE REACHED SUCCESSFULLY');

});