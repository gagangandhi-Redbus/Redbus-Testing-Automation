import { test, expect } from '@playwright/test';

test('RedBus - Delhi (Anand Vihar) to Dehradun Booking Flow', async ({ page }) => {
  test.setTimeout(280000);

  // Open RedBus
  await page.goto('https://www.redbus.sg/');
//   await expect(page).toHaveTitle(/redBus/i);
  console.log("Opened The First Page/ Line number 9 code is correct");
//   // Select Source
//   await page.locator('div').filter({ hasText: /^From$/ }).nth(1).click();
//   await page.getByRole('button', {
//     name: /Anand Vihar, Delhi/i
//   }).click();
//   console.log("Selected Source Successfully / Line 15 code is correct");


// Open Source dropdown
await page.locator('div').filter({ hasText: /^From$/ }).nth(1).click();

console.log("Selecting first available source...");

// Select first source from the list
await page.getByRole('button').first().click();

console.log("✅ First source selected");
// await page.locator('div').filter({ hasText: /^From$/ }).nth(1).click();

// const firstSource = page
//   .locator('[role="button"]')
//   .filter({ hasText: /\S/ })
//   .first();

// await firstSource.click();

// console.log("✅ First source selected");

  // Select Destination
// Open Destination dropdown
await page.getByRole('combobox', { name: 'To' }).click();

console.log("Selecting first available destination...");

// Select first destination
const firstDestination = page.getByRole('button').filter({
  hasText: /\S/
}).first();

await firstDestination.click();

console.log("✅ First destination selected");

//   await page.getByRole('combobox', { name: 'To' }).click();
//   await page.getByRole('button', {
//     name: /Dehradun/i
//   }).click();
//  console.log("Selected Destination Successfully / Line 22 code is correct")
  // Select Date
  await page.getByRole('dialog', {
    name: /Select date of journey/i
  }).click();
  await page.getByRole('button', {
    name: /Tuesday, July 21/i
  }).click();
console.log("Date Selected Successfully / Line 30 code is correct")
  // Search Buses
  await page.getByRole('button', {
    name: /Search buses/i
  }).first().click();

  await page.waitForLoadState('networkidle');
console.log("Bus search Successfully / Line 37 code is correct")

  // Verify Results
  await expect(page).toHaveURL(/search/);
//   await page.screenshot({
//     path: 'screenshots/search-results.png',
//     fullPage: true,
//   });

  // Open First Bus
//   await page.getByLabel(/View seats for LEAFYBUS Premium Business Class/i).first().click();
console.log("Opening first available bus...");

const firstBus = page.getByRole('button', {
  name: /View seats/i
}).first();

await expect(firstBus).toBeVisible();
await firstBus.click();

console.log("First bus opened successfully.");


console.log("Opened first bus successfully/ Line 49 completed ")
  // Select Seat
//   await page.getByLabel(/Seat number 6/i).first().click();
// await page.locator('.availableSeat').first().click();
// const seats = page.locator('[aria-label*="Seat number"]');

// const count = await seats.count();

// for (let i = 0; i < count; i++) {
//   const seat = seats.nth(i);

//   if (await seat.isEnabled()) {
//     await seat.click();
//     console.log(`✅ Selected seat index ${i}`);
//     break;
//   }
// }
// await page.locator('svg.available').first().click();
// here the seat is selected as random the best part 
const firstAvailableSeat = page.locator(
  'div[role="button"][aria-label*="availability available"]'
).first();

await expect(firstAvailableSeat).toBeVisible();
await firstAvailableSeat.click();

console.log("✅ First available seat selected");
console.log("Selected Seat Successfully/ Line 49 completed ")
//   // Boarding & Dropping


// Boarding & Dropping
await page.getByLabel(/Select boarding & dropping/i).click();
console.log("Selected Boarding & Dropping");

// Boarding Point
await page.getByLabel(/08:35 ISBT Kashmiri gate 47 - 49/i).click();
console.log("Boarding Point Selected");

// Dropping Point
await page.getByLabel(/15:45 Rispana Chowk/i).click();
console.log("Dropping Point Selected");
//   await page.getByLabel(/Select boarding & dropping/i).click();
// console.log("Selected Boookign and Dropping/ line 55 completed ")
//   await page.getByLabel(/17:00 Kashmere Gate ISBT/i).first().click();
// console.log("checking the end code")
//   await page.getByLabel(/23:45 Mall Of Dehradun/i).click();
// console.log("Enterring Passengers details ")
// console.log("Selecting first boarding point...");

// const boardingPoint = page
//   .locator('ul[aria-label="Boarding points"] [role="radio"]')
//   .first();

// await expect(boardingPoint).toBeVisible();
// await boardingPoint.click();

// console.log("✅ First boarding point selected");
// console.log("Selecting first boarding point...");

// const boarding = page
//   .locator('#bpdp-list')
//   .nth(0)
//   .locator('[role="radio"]')
//   .first();

// await boarding.waitFor();
// await boarding.click();

// console.log("✅ First boarding selected");

// console.log("Selecting first dropping point...");

// const dropping = page
//   .locator('#bpdp-list')
//   .nth(1)
//   .locator('[role="radio"]')
//   .first();

// await dropping.waitFor();
// await dropping.click();

// console.log("✅ First dropping selected");
// const lists = page.locator('#bpdp-list');

// await lists.nth(0).locator('[role="radio"]').first().click();

// await lists.nth(1).locator('[role="radio"]').first().click();

  // Passenger Details
  await page.getByLabel('Phone *').fill('9911679155');
console.log("entered the phoen number")
  await page.getByPlaceholder('Enter email id')
      .fill('gagangandhi4080@gmail.com');
console.log("entered the email.id ")
  await page.getByLabel('State of Residence *').click();
console.log("entered the state of residence ")
  await page.locator('text=Delhi').last().click();
console.log("enterring the name as gagan")
  await page.getByRole('textbox', {
    name: 'Name *'
  }).fill('Gagan');
console.log("enterring the age ")
  await page.getByRole('spinbutton', {
    name: 'Age *'
  }).fill('23');
console.log("checking the error code line")
  await page.getByRole('radio', {
  name: /Don’t add redBus Assurance/i
}).click();
console.log("Entered the whole passengers details successfully ")
  // Don't add Insurance
  await page.getByRole('radio', {
  name: /Don’t add redBus Assurance/i
}).click();
console.log("Dont add insurance selected ")
  // Continue Booking
  await page.getByRole('button', {
    name: /Continue booking/i
  }).click();
console.log("clicked on continue booking")
  // Verify Payment Page
  await expect(
    page.getByText(/Payment|Credit\/Debit Card/i)
  ).toBeVisible();

  await page.screenshot({
    path: 'screenshots/payment-page.png',
    fullPage: true,
  });

  console.log('✅ Booking flow executed successfully');
});