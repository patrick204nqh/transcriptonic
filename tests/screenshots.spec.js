// @ts-check
/**
 * Screenshot capture suite — generates UI assets for the README.
 * Run with: npx playwright test tests/screenshots.spec.js
 * Output: docs/assets/
 */
import { test } from './fixtures/extension.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../docs/assets');

// Seed realistic meeting data into chrome.storage.local
const MOCK_MEETINGS = [
    {
        meetingSoftware: "Google Meet",
        meetingTitle: "Q2 Product Review",
        meetingStartTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        meetingEndTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        transcript: [
            { personName: "Sarah", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), transcriptText: "Let's start with the roadmap update." },
            { personName: "Alex", timestamp: new Date(Date.now() - 119 * 60 * 1000).toISOString(), transcriptText: "We shipped the new dashboard last week." }
        ],
        chatMessages: [],
        webhookPostStatus: "successful"
    },
    {
        meetingSoftware: "Google Meet",
        meetingTitle: "Engineering Standup",
        meetingStartTimestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        meetingEndTimestamp: new Date(Date.now() - 25.5 * 60 * 60 * 1000).toISOString(),
        transcript: [
            { personName: "Jamie", timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), transcriptText: "No blockers on my end." }
        ],
        chatMessages: [],
        webhookPostStatus: "successful"
    },
    {
        meetingSoftware: "Google Meet",
        meetingTitle: "1:1 with Manager",
        meetingStartTimestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
        meetingEndTimestamp: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(),
        transcript: [
            { personName: "Jordan", timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(), transcriptText: "How are you feeling about the project timeline?" }
        ],
        chatMessages: [],
        webhookPostStatus: "failed"
    },
    {
        meetingSoftware: "Google Meet",
        meetingTitle: "Design Review — Navigation Redesign",
        meetingStartTimestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        meetingEndTimestamp: new Date(Date.now() - 70.5 * 60 * 60 * 1000).toISOString(),
        transcript: [],
        chatMessages: [
            { personName: "Pat", timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), chatMessageText: "Here's the Figma link: figma.com/..." }
        ],
        webhookPostStatus: "new"
    }
];

test('capture popup screenshot', async ({ page, extensionId }) => {
    await page.setViewportSize({ width: 400, height: 600 });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForLoadState('domcontentloaded');
    // Ensure auto-mode radio renders as selected
    await page.waitForTimeout(300);
    await page.screenshot({
        path: path.join(OUT, 'popup.png'),
        clip: { x: 0, y: 0, width: 400, height: 420 }
    });
});

test('capture meetings page — with data', async ({ page, extensionId }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Seed mock data before loading the page
    await page.goto(`chrome-extension://${extensionId}/meetings.html`);
    await page.waitForLoadState('domcontentloaded');

    await page.evaluate((meetings) => {
        return new Promise((resolve) => {
            chrome.storage.local.set({ meetings }, resolve);
        });
    }, MOCK_MEETINGS);

    // Reload so the table renders with the data
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    // Full-page screenshot of meetings table
    const tableContainer = page.locator('#last-10-meetings');
    await tableContainer.screenshot({ path: path.join(OUT, 'meetings-table.png') });
});

test('capture webhook config screenshot', async ({ page, extensionId }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`chrome-extension://${extensionId}/meetings.html#webhooks`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(300);

    const webhookSection = page.locator('#webhooks');
    await webhookSection.screenshot({ path: path.join(OUT, 'webhooks.png') });
});
