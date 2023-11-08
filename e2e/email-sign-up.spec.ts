import { test, expect } from '@playwright/test';

import translations from '../client/i18n/locales/english/translations.json';

const apiLocation = process.env.API_LOCATION || 'http://localhost:3000';

test.describe('Email sign-up page when user is not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    // Intercept the endpoint to prevent `acceptedPrivacyTerms` from being set
    await page.route('*/**/update-privacy-terms', async route => {
      const json = [{ message: 'flash.privacy-updated', type: 'success' }];
      await route.fulfill({ json });
    });

    await page.goto('/email-sign-up');
  });

  test("should not enable Quincy's weekly newsletter when the user clicks the sign up button", async ({
    page
  }) => {
    await expect(page).toHaveTitle('Email Sign Up | freeCodeCamp.org');
    await expect(
      page.getByText(
        'freeCodeCamp is a proven path to your first software developer job.'
      )
    ).toBeVisible();

    const signupLink = page.getByRole('link', {
      name: translations.buttons['sign-up-email-list']
    });

    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute('href', `${apiLocation}/signin`);
    await signupLink.click();

    // The user is signed in and automatically redirected to /learn after clicking the button.
    // We wait for this navigation to complete before moving onto the next.
    await page.waitForURL('**/learn');
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Full Stack User' })
    ).toBeVisible();

    await page.goto('/settings');
    await expect(
      page.getByRole('group', { name: translations.settings.email.weekly })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: translations.buttons['yes-please'] })
    ).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('button', { name: translations.buttons['no-thanks'] })
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Email sign-up page when user is signed in', () => {
  test.use({ storageState: 'playwright/.auth/certified-user.json' });

  test.beforeEach(async ({ page }) => {
    await page.route('*/**/user/get-session-user', async route => {
      const response = await route.fetch();
      const json = await response.json();

      // /email-sign-up is only accessible if `acceptedPrivacyTerms` is `false`.
      // We need to patch the response in order to access the page.
      json.user.certifieduser.acceptedPrivacyTerms = false;
      json.user.certifieduser.sendQuincyEmail = false;
      await route.fulfill({ json });
    });

    // Intercept the endpoint to prevent `acceptedPrivacyTerms` from being set
    await page.route('*/**/update-privacy-terms', async route => {
      const json = [{ message: 'flash.privacy-updated', type: 'success' }];
      await route.fulfill({ json });
    });

    await page.goto('/email-sign-up');
  });

  test("should disable Quincy's weekly newsletter if the user clicks No", async ({
    page
  }) => {
    await expect(page).toHaveTitle('Email Sign Up | freeCodeCamp.org');
    await expect(
      page.getByText(
        'freeCodeCamp is a proven path to your first software developer job.'
      )
    ).toBeVisible();

    const signupButton = page.getByRole('button', {
      name: translations.buttons['no-thanks']
    });

    await expect(signupButton).toBeVisible();
    await signupButton.click();

    // The user is signed in and automatically redirected to /learn after clicking the button.
    // We wait for the navigation to complete.
    await page.waitForURL('**/learn');
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Full Stack User' })
    ).toBeVisible();

    await page.goto('/settings');
    await expect(
      page.getByRole('group', { name: translations.settings.email.weekly })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: translations.buttons['no-thanks'] })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: translations.buttons['yes-please'] })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  test("should enable Quincy's weekly newsletter if the user clicks Yes", async ({
    page
  }) => {
    await expect(page).toHaveTitle('Email Sign Up | freeCodeCamp.org');
    await expect(
      page.getByText(
        'freeCodeCamp is a proven path to your first software developer job.'
      )
    ).toBeVisible();

    const signupButton = page.getByRole('button', {
      name: translations.buttons['yes-please']
    });

    await expect(signupButton).toBeVisible();
    await signupButton.click();

    // The user is signed in and automatically redirected to /learn after clicking the button.
    // We wait for the navigation to complete.
    await page.waitForURL('**/learn');
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Full Stack User' })
    ).toBeVisible();

    // When the user clicks Yes, the /update-privacy-terms API is called
    // to update both `acceptedPrivacyTerms` and `sendQuincyEmail`.
    // But `sendQuincyEmail` is not set in the DB since the endpoint is mocked,
    // so we are overriding the user data once again to mimic the real behavior.
    await page.route('*/**/user/get-session-user', async route => {
      const response = await route.fetch();
      const json = await response.json();

      json.user.certifieduser.sendQuincyEmail = true;
      await route.fulfill({ json });
    });

    await page.goto('/settings');
    await expect(
      page.getByRole('group', { name: translations.settings.email.weekly })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: translations.buttons['yes-please'] })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: translations.buttons['no-thanks'] })
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
