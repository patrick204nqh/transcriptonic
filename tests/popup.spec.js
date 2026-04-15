import { test, expect } from './fixtures/extension.js';

test.describe('Popup', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  });

  test('renders the extension title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('TranscripTonic');
  });

  test('shows platform toggles for Google Meet, Teams, and Zoom', async ({ page }) => {
    await expect(page.locator('#enable-google-meet')).toBeVisible();
    await expect(page.locator('label[for="enable-google-meet"]')).toContainText('Google Meet');

    await expect(page.locator('#enable-teams')).toBeVisible();
    await expect(page.locator('label[for="enable-teams"]')).toContainText('Teams');

    await expect(page.locator('#enable-zoom')).toBeVisible();
    await expect(page.locator('label[for="enable-zoom"]')).toContainText('Zoom');
  });

  test('shows Auto mode and Manual mode radio buttons', async ({ page }) => {
    await expect(page.locator('#auto-mode')).toBeVisible();
    await expect(page.locator('label[for="auto-mode"]')).toContainText('Auto mode');

    await expect(page.locator('#manual-mode')).toBeVisible();
    await expect(page.locator('label[for="manual-mode"]')).toContainText('Manual mode');
  });

  test('platform toggles are unchecked by default', async ({ page }) => {
    await expect(page.locator('#enable-google-meet')).not.toBeChecked();
    await expect(page.locator('#enable-teams')).not.toBeChecked();
    await expect(page.locator('#enable-zoom')).not.toBeChecked();
  });

  test('can toggle Google Meet platform on and off', async ({ page }) => {
    const checkbox = page.locator('#enable-google-meet');
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('shows link to meetings page', async ({ page }) => {
    await expect(page.locator('a[href="./meetings.html"]')).toBeVisible();
  });
});
