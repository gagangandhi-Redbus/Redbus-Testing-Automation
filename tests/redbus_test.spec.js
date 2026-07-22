import { test, expect } from '@playwright/test';

test('RedBus Demo Synthetic Monitoring', async ({ page }) => {
  test.setTimeout(120000);

  // Open RedBus
  await page.goto('https://www.redbus.in/');

  // Verify Homepage
  await expect(page).toHaveTitle(/redBus/i);

  // Select From
  await page.locator('div').filter({ hasText: /^From$/ }).nth(1).click();
  await page.getByRole('button', {
    name: /Kashmiri Gate, Delhi/i
  }).click();

  // Select Destination
  await page.getByRole('button', {
    name: /Lucknow/i
  }).click();

  // Select Journey Date
  await page.getByRole('dialog', {
    name: /Select date/i
  }).click();

  await page.getByRole('button', {
    name: /Tuesday, July 21/i
  }).click();

  // Search Buses
  await page.getByRole('button', {
    name: /Search buses/i
  }).click();

  // Wait for Results
  await page.waitForLoadState('networkidle');

  // Verify Results Page
  await expect(page).toHaveURL(/bus-tickets/);

  // Screenshot
  await page.screenshot({
    path: 'screenshots/bus-results.png',
    fullPage: true
  });

  // Open First Bus
  await page.getByRole('button', {
    name: /View seats/i
  }).first().click();

  // Wait
  await page.waitForTimeout(3000);

  // Verify Seat Layout
  await expect(
    page.getByText(/Select boarding/i)
  ).toBeVisible();

  // Screenshot
  await page.screenshot({
    path: 'screenshots/seat-layout.png',
    fullPage: true
  });

  console.log("✅ RedBus Synthetic Monitoring Passed");
});