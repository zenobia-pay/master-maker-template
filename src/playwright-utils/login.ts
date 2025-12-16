import { Page } from '@playwright/test';

/**
 * Login helper for Playwright tests
 */
export async function login(page: Page) {
  const testEmail = 'test-agent@gmail.com';
  const testPassword = 'password123';

  await page.goto('http://localhost:3000/login/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });

  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');

  await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
}
