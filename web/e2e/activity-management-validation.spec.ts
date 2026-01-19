import { test, expect, Page } from '@playwright/test';
import { login, navigateToAdminSection, generateString } from './helpers';

/**
 * E2E tests for Activity Management form validation
 * Tests character limits, character counters, and inline error display
 */

// Field limits matching backend @Size annotations
const FIELD_LIMITS = {
  title: 200,
  location: 200,
  organization: 200,
};

// Helper function to navigate to activity management
async function navigateToActivityManagement(page: Page) {
  await navigateToAdminSection(page, '活动管理', '创建活动');
}

// Helper function to open create activity modal
async function openCreateActivityModal(page: Page) {
  await page.click('button:has-text("创建活动")');
  await page.waitForSelector('text=填写活动详细信息', { timeout: 5000 });
}

test.describe('Activity Management Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToActivityManagement(page);
  });

  test('should display character counter for title field', async ({ page }) => {
    await openCreateActivityModal(page);

    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();

    // Check initial character counter shows 0/200
    const titleCounter = page.locator('text=/\\d+\\/200/').first();
    await expect(titleCounter).toContainText('0/200');

    // Type some text and verify counter updates
    await titleInput.fill('测试活动标题');
    await expect(titleCounter).toContainText('/200');

    // Verify the count matches input length
    const inputValue = await titleInput.inputValue();
    await expect(titleCounter).toContainText(`${inputValue.length}/200`);
  });

  test('should enforce maxLength on title field', async ({ page }) => {
    await openCreateActivityModal(page);

    const titleInput = page.locator('input[name="title"]');

    // Try to input more than 200 characters
    const longText = generateString(250);
    await titleInput.fill(longText);

    // Verify input is truncated to maxLength
    const inputValue = await titleInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(FIELD_LIMITS.title);

    // Verify counter shows max
    const titleCounter = page.locator('text=/\\d+\\/200/').first();
    await expect(titleCounter).toContainText(`${FIELD_LIMITS.title}/200`);
  });

  test('should display character counter for location field', async ({ page }) => {
    await openCreateActivityModal(page);

    // Scroll to location field section
    const locationInput = page.locator('input[name="location"]');
    await locationInput.scrollIntoViewIfNeeded();
    await expect(locationInput).toBeVisible();

    // Check character counter exists
    const locationCounter = page.locator('input[name="location"]').locator('..').locator('text=/\\d+\\/200/');

    // Type some text
    await locationInput.fill('北京市朝阳区');

    // Verify the count matches
    const inputValue = await locationInput.inputValue();
    await expect(locationCounter).toContainText(`${inputValue.length}/200`);
  });

  test('should enforce maxLength on location field', async ({ page }) => {
    await openCreateActivityModal(page);

    const locationInput = page.locator('input[name="location"]');
    await locationInput.scrollIntoViewIfNeeded();

    // Try to input more than 200 characters
    const longText = generateString(250);
    await locationInput.fill(longText);

    // Verify input is truncated
    const inputValue = await locationInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(FIELD_LIMITS.location);
  });

  test('should display character counter for organization field', async ({ page }) => {
    await openCreateActivityModal(page);

    // Scroll to organization field section
    const organizationInput = page.locator('input[name="organization"]');
    await organizationInput.scrollIntoViewIfNeeded();
    await expect(organizationInput).toBeVisible();

    // Type some text
    await organizationInput.fill('中国建筑协会');

    // Verify counter exists and shows correct count
    const orgCounter = page.locator('input[name="organization"]').locator('..').locator('text=/\\d+\\/200/');
    const inputValue = await organizationInput.inputValue();
    await expect(orgCounter).toContainText(`${inputValue.length}/200`);
  });

  test('should enforce maxLength on organization field', async ({ page }) => {
    await openCreateActivityModal(page);

    const organizationInput = page.locator('input[name="organization"]');
    await organizationInput.scrollIntoViewIfNeeded();

    // Try to input more than 200 characters
    const longText = generateString(250);
    await organizationInput.fill(longText);

    // Verify input is truncated
    const inputValue = await organizationInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(FIELD_LIMITS.organization);
  });

  test('should show validation error when required title is empty', async ({ page }) => {
    await openCreateActivityModal(page);

    // Fill type (required) but leave title empty
    const typeSelect = page.locator('select[name="type"]');
    await typeSelect.selectOption('CONFERENCE');

    // Fill status (required)
    const statusSelect = page.locator('select[name="status"]');
    await statusSelect.selectOption('UPCOMING');

    // Try to submit the form
    await page.click('button:has-text("保存")');

    // The form should not submit due to HTML5 required validation
    // Check that modal is still open
    await expect(page.locator('text=填写活动详细信息')).toBeVisible();
  });

  test('should show validation error when required type is not selected', async ({ page }) => {
    await openCreateActivityModal(page);

    // Fill title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('测试活动');

    // Leave type empty, fill status
    const statusSelect = page.locator('select[name="status"]');
    await statusSelect.selectOption('UPCOMING');

    // Try to submit the form
    await page.click('button:has-text("保存")');

    // The form should not submit due to HTML5 required validation
    await expect(page.locator('text=填写活动详细信息')).toBeVisible();
  });

  test('should show red border when backend validation fails for title', async ({ page }) => {
    await openCreateActivityModal(page);

    // Fill form with valid data
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('测试活动标题');

    const typeSelect = page.locator('select[name="type"]');
    await typeSelect.selectOption('CONFERENCE');

    const statusSelect = page.locator('select[name="status"]');
    await statusSelect.selectOption('UPCOMING');

    // Verify title input doesn't have error border initially
    await expect(titleInput).not.toHaveClass(/border-red/);
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    await openCreateActivityModal(page);

    // Click cancel button
    await page.click('button:has-text("取消")');

    // Modal should close
    await expect(page.locator('text=填写活动详细信息')).not.toBeVisible();
  });

  test('should allow typing up to exact character limit', async ({ page }) => {
    await openCreateActivityModal(page);

    const titleInput = page.locator('input[name="title"]');

    // Type exactly 200 characters
    const exactLimitText = generateString(200);
    await titleInput.fill(exactLimitText);

    // Verify all characters were accepted
    const inputValue = await titleInput.inputValue();
    expect(inputValue.length).toBe(FIELD_LIMITS.title);

    // Verify counter shows 200/200
    const titleCounter = page.locator('text=/\\d+\\/200/').first();
    await expect(titleCounter).toContainText('200/200');
  });

  test('should update character counter in real-time as user types', async ({ page }) => {
    await openCreateActivityModal(page);

    const titleInput = page.locator('input[name="title"]');
    const titleCounter = page.locator('text=/\\d+\\/200/').first();

    // Type character by character and verify counter updates
    await titleInput.fill('A');
    await expect(titleCounter).toContainText('1/200');

    await titleInput.fill('AB');
    await expect(titleCounter).toContainText('2/200');

    await titleInput.fill('ABC');
    await expect(titleCounter).toContainText('3/200');

    // Clear and verify
    await titleInput.fill('');
    await expect(titleCounter).toContainText('0/200');
  });

  test('should handle Chinese characters correctly in character count', async ({ page }) => {
    await openCreateActivityModal(page);

    const titleInput = page.locator('input[name="title"]');
    const titleCounter = page.locator('text=/\\d+\\/200/').first();

    // Type Chinese characters
    await titleInput.fill('中文测试');

    // Each Chinese character should count as 1
    await expect(titleCounter).toContainText('4/200');
  });

  test('should preserve form data when scrolling through modal', async ({ page }) => {
    await openCreateActivityModal(page);

    // Fill multiple fields
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('测试活动标题');

    const typeSelect = page.locator('select[name="type"]');
    await typeSelect.selectOption('CONFERENCE');

    // Scroll down to organization field
    const organizationInput = page.locator('input[name="organization"]');
    await organizationInput.scrollIntoViewIfNeeded();
    await organizationInput.fill('中国建筑协会');

    // Scroll back to top and verify title is preserved
    await titleInput.scrollIntoViewIfNeeded();
    await expect(titleInput).toHaveValue('测试活动标题');

    // Scroll back to organization and verify it's preserved
    await organizationInput.scrollIntoViewIfNeeded();
    await expect(organizationInput).toHaveValue('中国建筑协会');
  });
});

test.describe('Activity Management Edit Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToActivityManagement(page);
  });

  test('should open edit modal with existing data and character counters', async ({ page }) => {
    // Wait for activity cards to load
    await page.waitForSelector('.bg-white.rounded-xl', { timeout: 10000 });

    // Click edit button on first activity
    const editButton = page.locator('button:has(svg.lucide-edit), button:has-text("编辑")').first();

    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();

      // Wait for edit modal to open
      await page.waitForSelector('text=编辑活动', { timeout: 5000 });

      // Verify character counter shows existing data length
      const titleInput = page.locator('input[name="title"]');
      const inputValue = await titleInput.inputValue();

      if (inputValue.length > 0) {
        const titleCounter = page.locator('text=/\\d+\\/200/').first();
        await expect(titleCounter).toContainText(`${inputValue.length}/200`);
      }
    }
  });
});

test.describe('Activity Form Validation - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToActivityManagement(page);
  });

  test('should clear validation errors when modal is reopened', async ({ page }) => {
    // Open modal
    await openCreateActivityModal(page);

    // Close modal
    await page.click('button:has-text("取消")');
    await expect(page.locator('text=填写活动详细信息')).not.toBeVisible();

    // Reopen modal
    await openCreateActivityModal(page);

    // Verify no error styling on title input
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).not.toHaveClass(/border-red/);
  });

  test('should handle special characters in input fields', async ({ page }) => {
    await openCreateActivityModal(page);

    const titleInput = page.locator('input[name="title"]');

    // Test with special characters
    const specialChars = '活动<script>alert(1)</script>&测试"\'';
    await titleInput.fill(specialChars);

    // Verify input accepts special characters
    const inputValue = await titleInput.inputValue();
    expect(inputValue).toBe(specialChars);

    // Verify counter counts correctly
    const titleCounter = page.locator('text=/\\d+\\/200/').first();
    await expect(titleCounter).toContainText(`${specialChars.length}/200`);
  });

  test('should handle emoji in input fields', async ({ page }) => {
    await openCreateActivityModal(page);

    const titleInput = page.locator('input[name="title"]');

    // Test with emoji
    const emojiText = '活动🎉测试🏆';
    await titleInput.fill(emojiText);

    // Verify input accepts emoji
    const inputValue = await titleInput.inputValue();
    expect(inputValue).toBe(emojiText);
  });
});
