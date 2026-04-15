# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: popup.spec.js >> Popup >> platform toggles are unchecked by default
- Location: tests/popup.spec.js:31:3

# Error details

```
Error: expect(locator).not.toBeChecked() failed

Locator:  locator('#enable-google-meet')
Expected: not checked
Received: checked
Timeout:  5000ms

Call log:
  - Expect "not toBeChecked" with timeout 5000ms
  - waiting for locator('#enable-google-meet')
    9 × locator resolved to <input type="checkbox" id="enable-google-meet"/>
      - unexpected value "checked"

```

# Test source

```ts
  1  | import { test, expect } from './fixtures/extension.js';
  2  | 
  3  | test.describe('Popup', () => {
  4  |   test.beforeEach(async ({ page, extensionId }) => {
  5  |     await page.goto(`chrome-extension://${extensionId}/popup.html`);
  6  |   });
  7  | 
  8  |   test('renders the extension title', async ({ page }) => {
  9  |     await expect(page.locator('h1')).toHaveText('TranscripTonic');
  10 |   });
  11 | 
  12 |   test('shows platform toggles for Google Meet, Teams, and Zoom', async ({ page }) => {
  13 |     await expect(page.locator('#enable-google-meet')).toBeVisible();
  14 |     await expect(page.locator('label[for="enable-google-meet"]')).toContainText('Google Meet');
  15 | 
  16 |     await expect(page.locator('#enable-teams')).toBeVisible();
  17 |     await expect(page.locator('label[for="enable-teams"]')).toContainText('Teams');
  18 | 
  19 |     await expect(page.locator('#enable-zoom')).toBeVisible();
  20 |     await expect(page.locator('label[for="enable-zoom"]')).toContainText('Zoom');
  21 |   });
  22 | 
  23 |   test('shows Auto mode and Manual mode radio buttons', async ({ page }) => {
  24 |     await expect(page.locator('#auto-mode')).toBeVisible();
  25 |     await expect(page.locator('label[for="auto-mode"]')).toContainText('Auto mode');
  26 | 
  27 |     await expect(page.locator('#manual-mode')).toBeVisible();
  28 |     await expect(page.locator('label[for="manual-mode"]')).toContainText('Manual mode');
  29 |   });
  30 | 
  31 |   test('platform toggles are unchecked by default', async ({ page }) => {
> 32 |     await expect(page.locator('#enable-google-meet')).not.toBeChecked();
     |                                                           ^ Error: expect(locator).not.toBeChecked() failed
  33 |     await expect(page.locator('#enable-teams')).not.toBeChecked();
  34 |     await expect(page.locator('#enable-zoom')).not.toBeChecked();
  35 |   });
  36 | 
  37 |   test('can toggle Google Meet platform on and off', async ({ page }) => {
  38 |     const checkbox = page.locator('#enable-google-meet');
  39 |     await checkbox.check();
  40 |     await expect(checkbox).toBeChecked();
  41 |     await checkbox.uncheck();
  42 |     await expect(checkbox).not.toBeChecked();
  43 |   });
  44 | 
  45 |   test('shows link to meetings page', async ({ page }) => {
  46 |     await expect(page.locator('a[href="./meetings.html"]')).toBeVisible();
  47 |   });
  48 | });
  49 | 
```