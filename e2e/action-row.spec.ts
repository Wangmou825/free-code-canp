import { test, expect, type Page, type Locator } from '@playwright/test';

const challengeButtons = [
  'Instructions',
  'index.html',
  'styles.css',
  'Console'
];

const editorButtons = ['index.html', 'styles.css'];

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto(
    '/learn/2022/responsive-web-design/build-a-survey-form-project/build-a-survey-form'
  );
});

test.afterAll(async () => {
  await page.close();
});

function getActionRowLocator(): Locator {
  return page.getByTestId('action-row');
}

function getTabsRowLocator(): Locator {
  return page.getByTestId('action-row');
}

test('Action row buttons are visible', async ({ isMobile }) => {
  const previewFrame = page.getByTitle('challenge preview');
  const actionRow = getActionRowLocator();
  const tabsRow = getTabsRowLocator();

  // if it's mobile action row component does not render
  if (isMobile) {
    await expect(actionRow).toBeHidden();
  } else {
    const n = challengeButtons.length;
    for (let i = 0; i < n; i++) {
      const btn = tabsRow.getByRole('button', { name: challengeButtons[i] });
      await expect(btn).toBeVisible();
    }
    await expect(previewFrame).toBeVisible();
  }
});

test('Clicking instructions button hides editor buttons', async ({
  isMobile
}) => {
  const instructionsButton = page.getByTestId('instructions-button');
  const tabsRow = getTabsRowLocator();

  if (isMobile) {
    await expect(tabsRow).toBeHidden();
  } else {
    // Click instructions button to hide instructions panel and editor buttons
    await instructionsButton.click();

    for (let i = 0; i < editorButtons.length; i++) {
      const btn = tabsRow.getByRole('button', { name: editorButtons[i] });
      await expect(btn).toBeHidden();
    }

    const instructionsPanelTitle = page.getByRole('heading', {
      name: 'Build a Survey Form'
    });
    await expect(instructionsPanelTitle).toBeHidden();
  }
});

test('Clicking Console button shows console panel', async ({ isMobile }) => {
  const actionRow = getActionRowLocator();
  const tabsRow = getTabsRowLocator();
  const consoleBtn = tabsRow.getByRole('button', { name: 'Console' });

  if (isMobile) {
    await expect(actionRow).toBeHidden();
  } else {
    // Click the console button to show the console panel
    await consoleBtn.click();
    const consolePanel = page.getByLabel('Console');
    await expect(consolePanel).toBeVisible();
  }
});

test('Clicking Preview button hides preview', async ({ isMobile }) => {
  const previewButton = page.getByTestId('preview-button');
  const previewFrame = page.getByTitle('challenge preview');
  const actionRow = getActionRowLocator();

  if (isMobile) {
    await expect(actionRow).toBeHidden();
  } else {
    await previewButton.click();
    await expect(previewFrame).toBeHidden();
  }
});
