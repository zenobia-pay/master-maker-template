import { Page } from '@playwright/test';

/**
 * Login helper for Playwright tests
 * If user doesn't exist, automatically creates the account
 */
export async function login(page: Page) {
  const testEmail = 'test-agent@gmail.com';
  const testPassword = 'password123';

  await page.goto('/login/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });

  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');

  // Wait for either navigation away from login or error notification
  const result = await Promise.race([
    page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 }).then(() => 'success'),
    page.waitForSelector('text=Invalid email or password', { timeout: 10000 }).then(() => 'invalid'),
  ]);

  if (result === 'invalid') {
    // User doesn't exist, create account
    await page.click('text=Don\'t have an account? Create one');
    await page.waitForSelector('text=Create account', { timeout: 10000 });

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Create Account")');

    // Wait for navigation and ensure no error dialog
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
  }

  // Final check: ensure no error notification is visible
  const errorVisible = await page.locator('text=Invalid email or password').isVisible().catch(() => false);
  if (errorVisible) {
    throw new Error('Login failed: error dialog still visible');
  }
}
