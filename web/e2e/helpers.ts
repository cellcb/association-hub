import { Page } from '@playwright/test';

/**
 * Shared E2E test helpers
 */

// Test credentials
export const TEST_USER = 'admin';
export const TEST_PASSWORD = '123456';

/**
 * Login to the application
 */
export async function login(page: Page) {
  await page.goto('/');

  // Click login button to open login modal
  const loginButton = page.locator('button:has-text("登录")').first();
  if (await loginButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginButton.click();

    // Wait for login modal to appear
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Fill credentials
    await page.fill('input[name="username"], input[placeholder*="用户名"], input[type="text"]', TEST_USER);
    await page.fill('input[name="password"], input[type="password"]', TEST_PASSWORD);

    // Submit login
    await page.locator('button[type="submit"]:has-text("登录"), form button:has-text("登录")').click();

    // Wait for login to complete
    await page.waitForURL(/.*admin.*|.*dashboard.*/i, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
}

/**
 * Navigate to admin panel
 */
export async function navigateToAdmin(page: Page) {
  const adminButton = page.locator('button:has-text("管理后台")').first();
  if (await adminButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await adminButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Navigate to a specific admin section by clicking sidebar link
 */
export async function navigateToAdminSection(page: Page, sectionName: string, waitForText: string) {
  await navigateToAdmin(page);

  const sectionLink = page.locator(`button:has-text("${sectionName}"), a:has-text("${sectionName}")`).first();
  await sectionLink.waitFor({ state: 'visible', timeout: 10000 });
  await sectionLink.click();

  await page.waitForSelector(`text=${waitForText}`, { timeout: 10000 });
}

/**
 * Generate string of specified length
 */
export function generateString(length: number, char: string = 'a'): string {
  return char.repeat(length);
}
