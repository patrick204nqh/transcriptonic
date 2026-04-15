// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Extensions require a headed browser — use --headed flag or run via `npm test`
  // For CI without a display server, wrap with: xvfb-run npm test
  use: {
    // Individual tests configure their own context via the extension fixture
    headless: false,
  },
  // Run tests sequentially so they share the same browser context setup
  workers: 1,
});
