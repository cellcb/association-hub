import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for Product Management form validation
 * Tests character limits, character counters, and inline error display
 */

// Test credentials
const TEST_USER = 'admin';
const TEST_PASSWORD = '123456';

// Field limits matching backend @Size annotations
const PRODUCT_FIELD_LIMITS = {
  name: 255,
  manufacturer: 255,
  model: 100,
  price: 100,
  summary: 500,
  contact: 100,
  contactPhone: 20,
  contactEmail: 100,
  website: 255,
};

const CATEGORY_FIELD_LIMITS = {
  name: 100,
  code: 50,
  description: 500,
};

// Helper function to login
async function login(page: Page) {
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

// Helper function to navigate to product management
async function navigateToProductManagement(page: Page) {
  // First, enter admin mode by clicking "管理后台"
  const adminButton = page.locator('button:has-text("管理后台")').first();
  if (await adminButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await adminButton.click();
    await page.waitForTimeout(500);
  }

  // Then click "产品管理" in the sidebar
  const productLink = page.locator('button:has-text("产品管理"), a:has-text("产品管理")').first();
  await productLink.waitFor({ state: 'visible', timeout: 10000 });
  await productLink.click();

  // Wait for the page to load
  await page.waitForSelector('text=添加产品', { timeout: 10000 });
}

// Helper function to navigate to product category management
async function navigateToProductCategoryManagement(page: Page) {
  // First, enter admin mode by clicking "管理后台"
  const adminButton = page.locator('button:has-text("管理后台")').first();
  if (await adminButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await adminButton.click();
    await page.waitForTimeout(500);
  }

  // Then click "产品分类" in the sidebar
  const categoryLink = page.locator('button:has-text("产品分类"), a:has-text("产品分类")').first();
  await categoryLink.waitFor({ state: 'visible', timeout: 10000 });
  await categoryLink.click();

  // Wait for the page to load
  await page.waitForSelector('text=新增分类', { timeout: 10000 });
}

// Helper function to open create product modal
async function openCreateProductModal(page: Page) {
  await page.click('button:has-text("添加产品")');
  await page.waitForSelector('text=填写产品详细信息', { timeout: 5000 });
}

// Helper function to open create category modal
async function openCreateCategoryModal(page: Page) {
  await page.click('button:has-text("新增分类")');
  await page.waitForSelector('text=新增分类', { timeout: 5000 });
}

// Generate string of specified length
function generateString(length: number, char: string = 'a'): string {
  return char.repeat(length);
}

test.describe('Product Management Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToProductManagement(page);
  });

  test('should display character counter for name field', async ({ page }) => {
    await openCreateProductModal(page);

    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();

    // Check initial character counter shows 0/255
    const nameCounter = page.locator('text=/\\d+\\/255/').first();
    await expect(nameCounter).toContainText('0/255');

    // Type some text and verify counter updates
    await nameInput.fill('测试产品名称');
    await expect(nameCounter).toContainText('/255');

    // Verify the count matches input length
    const inputValue = await nameInput.inputValue();
    await expect(nameCounter).toContainText(`${inputValue.length}/255`);
  });

  test('should enforce maxLength on name field', async ({ page }) => {
    await openCreateProductModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Try to input more than 255 characters
    const longText = generateString(300);
    await nameInput.fill(longText);

    // Verify input is truncated to maxLength
    const inputValue = await nameInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(PRODUCT_FIELD_LIMITS.name);

    // Verify counter shows max
    const nameCounter = page.locator('text=/\\d+\\/255/').first();
    await expect(nameCounter).toContainText(`${PRODUCT_FIELD_LIMITS.name}/255`);
  });

  test('should display character counter for model field', async ({ page }) => {
    await openCreateProductModal(page);

    const modelInput = page.locator('input[name="model"]');
    await expect(modelInput).toBeVisible();

    // Type some text
    await modelInput.fill('ABC-123');

    // Verify counter exists and shows correct count
    const modelCounter = page.locator('input[name="model"]').locator('..').locator('text=/\\d+\\/100/');
    const inputValue = await modelInput.inputValue();
    await expect(modelCounter).toContainText(`${inputValue.length}/100`);
  });

  test('should enforce maxLength on model field', async ({ page }) => {
    await openCreateProductModal(page);

    const modelInput = page.locator('input[name="model"]');

    // Try to input more than 100 characters
    const longText = generateString(150);
    await modelInput.fill(longText);

    // Verify input is truncated
    const inputValue = await modelInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(PRODUCT_FIELD_LIMITS.model);
  });

  test('should display character counter for contactPhone field', async ({ page }) => {
    await openCreateProductModal(page);

    // Scroll to contact section
    const contactPhoneInput = page.locator('input[name="contactPhone"]');
    await contactPhoneInput.scrollIntoViewIfNeeded();
    await expect(contactPhoneInput).toBeVisible();

    // Type some text
    await contactPhoneInput.fill('13800138000');

    // Verify counter shows correct count
    const phoneCounter = page.locator('input[name="contactPhone"]').locator('..').locator('text=/\\d+\\/20/');
    const inputValue = await contactPhoneInput.inputValue();
    await expect(phoneCounter).toContainText(`${inputValue.length}/20`);
  });

  test('should enforce maxLength on contactPhone field (20 chars)', async ({ page }) => {
    await openCreateProductModal(page);

    const contactPhoneInput = page.locator('input[name="contactPhone"]');
    await contactPhoneInput.scrollIntoViewIfNeeded();

    // Try to input more than 20 characters
    const longText = generateString(30, '1');
    await contactPhoneInput.fill(longText);

    // Verify input is truncated to 20
    const inputValue = await contactPhoneInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(PRODUCT_FIELD_LIMITS.contactPhone);
  });

  test('should display character counter for summary field', async ({ page }) => {
    await openCreateProductModal(page);

    const summaryInput = page.locator('textarea[name="summary"]');
    await summaryInput.scrollIntoViewIfNeeded();
    await expect(summaryInput).toBeVisible();

    // Type some text
    await summaryInput.fill('这是一个产品摘要');

    // Verify counter shows correct count
    const summaryCounter = page.locator('textarea[name="summary"]').locator('..').locator('text=/\\d+\\/500/');
    const inputValue = await summaryInput.inputValue();
    await expect(summaryCounter).toContainText(`${inputValue.length}/500`);
  });

  test('should enforce maxLength on summary field', async ({ page }) => {
    await openCreateProductModal(page);

    const summaryInput = page.locator('textarea[name="summary"]');
    await summaryInput.scrollIntoViewIfNeeded();

    // Try to input more than 500 characters
    const longText = generateString(600);
    await summaryInput.fill(longText);

    // Verify input is truncated
    const inputValue = await summaryInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(PRODUCT_FIELD_LIMITS.summary);
  });

  test('should show validation error when required name is empty', async ({ page }) => {
    await openCreateProductModal(page);

    // Leave name empty and try to submit
    await page.click('button:has-text("保存")');

    // The form should not submit due to HTML5 required validation
    // Check that modal is still open
    await expect(page.locator('text=填写产品详细信息')).toBeVisible();
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    await openCreateProductModal(page);

    // Click cancel button
    await page.click('button:has-text("取消")');

    // Modal should close
    await expect(page.locator('text=填写产品详细信息')).not.toBeVisible();
  });

  test('should allow typing up to exact character limit for name', async ({ page }) => {
    await openCreateProductModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Type exactly 255 characters
    const exactLimitText = generateString(255);
    await nameInput.fill(exactLimitText);

    // Verify all characters were accepted
    const inputValue = await nameInput.inputValue();
    expect(inputValue.length).toBe(PRODUCT_FIELD_LIMITS.name);

    // Verify counter shows 255/255
    const nameCounter = page.locator('text=/\\d+\\/255/').first();
    await expect(nameCounter).toContainText('255/255');
  });

  test('should handle Chinese characters correctly in character count', async ({ page }) => {
    await openCreateProductModal(page);

    const nameInput = page.locator('input[name="name"]');
    const nameCounter = page.locator('text=/\\d+\\/255/').first();

    // Type Chinese characters
    await nameInput.fill('中文产品测试');

    // Each Chinese character should count as 1
    await expect(nameCounter).toContainText('6/255');
  });

  test('should preserve form data when scrolling through modal', async ({ page }) => {
    await openCreateProductModal(page);

    // Fill multiple fields
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('测试产品名称');

    const modelInput = page.locator('input[name="model"]');
    await modelInput.fill('MODEL-001');

    // Scroll down to contact section
    const contactPhoneInput = page.locator('input[name="contactPhone"]');
    await contactPhoneInput.scrollIntoViewIfNeeded();
    await contactPhoneInput.fill('13800138000');

    // Scroll back to top and verify name is preserved
    await nameInput.scrollIntoViewIfNeeded();
    await expect(nameInput).toHaveValue('测试产品名称');

    // Verify model is preserved
    await expect(modelInput).toHaveValue('MODEL-001');

    // Scroll back to contactPhone and verify it's preserved
    await contactPhoneInput.scrollIntoViewIfNeeded();
    await expect(contactPhoneInput).toHaveValue('13800138000');
  });
});

test.describe('Product Category Management Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToProductCategoryManagement(page);
  });

  test('should display character counter for category name field', async ({ page }) => {
    await openCreateCategoryModal(page);

    const nameInput = page.locator('input').filter({ hasText: '' }).first();

    // Find the name input by looking for the one with maxLength 100
    const categoryNameInput = page.locator('input[maxLength="100"]').first();
    await expect(categoryNameInput).toBeVisible();

    // Type some text
    await categoryNameInput.fill('测试分类');

    // Verify counter shows correct count
    const nameCounter = page.locator('text=/\\d+\\/100/').first();
    await expect(nameCounter).toContainText('4/100');
  });

  test('should enforce maxLength on category name field (100 chars)', async ({ page }) => {
    await openCreateCategoryModal(page);

    const categoryNameInput = page.locator('input[maxLength="100"]').first();

    // Try to input more than 100 characters
    const longText = generateString(150);
    await categoryNameInput.fill(longText);

    // Verify input is truncated to 100
    const inputValue = await categoryNameInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(CATEGORY_FIELD_LIMITS.name);
  });

  test('should display character counter for code field', async ({ page }) => {
    await openCreateCategoryModal(page);

    const codeInput = page.locator('input[maxLength="50"]').first();
    await expect(codeInput).toBeVisible();

    // Type some text (should auto-uppercase)
    await codeInput.fill('test_code');

    // Verify counter shows correct count
    const codeCounter = page.locator('text=/\\d+\\/50/').first();
    const inputValue = await codeInput.inputValue();
    await expect(codeCounter).toContainText(`${inputValue.length}/50`);
  });

  test('should enforce maxLength on code field (50 chars)', async ({ page }) => {
    await openCreateCategoryModal(page);

    const codeInput = page.locator('input[maxLength="50"]').first();

    // Try to input more than 50 characters
    const longText = generateString(60, 'A');
    await codeInput.fill(longText);

    // Verify input is truncated to 50
    const inputValue = await codeInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(CATEGORY_FIELD_LIMITS.code);
  });

  test('should auto-uppercase code input', async ({ page }) => {
    await openCreateCategoryModal(page);

    const codeInput = page.locator('input[maxLength="50"]').first();

    // Type lowercase
    await codeInput.fill('test_code');

    // Verify it's converted to uppercase
    const inputValue = await codeInput.inputValue();
    expect(inputValue).toBe('TEST_CODE');
  });

  test('should display character counter for description field', async ({ page }) => {
    await openCreateCategoryModal(page);

    const descriptionInput = page.locator('textarea[maxLength="500"]').first();
    await expect(descriptionInput).toBeVisible();

    // Type some text
    await descriptionInput.fill('这是分类描述');

    // Verify counter shows correct count
    const descCounter = page.locator('text=/\\d+\\/500/').first();
    await expect(descCounter).toContainText('6/500');
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    await openCreateCategoryModal(page);

    // Click cancel button
    await page.click('button:has-text("取消")');

    // Modal should close - verify by checking the modal content is gone
    await page.waitForTimeout(500);
    const modalContent = page.locator('.fixed.inset-0').locator('text=分类名称');
    await expect(modalContent).not.toBeVisible();
  });

  test('should show validation error when category name is empty', async ({ page }) => {
    await openCreateCategoryModal(page);

    // Leave name empty and try to submit
    await page.click('button:has-text("创建")');

    // Should show error message
    await expect(page.locator('text=分类名称不能为空')).toBeVisible();
  });
});

test.describe('Product Form Validation - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToProductManagement(page);
  });

  test('should clear validation errors when modal is reopened', async ({ page }) => {
    // Open modal
    await openCreateProductModal(page);

    // Close modal
    await page.click('button:has-text("取消")');
    await expect(page.locator('text=填写产品详细信息')).not.toBeVisible();

    // Reopen modal
    await openCreateProductModal(page);

    // Verify no error styling on name input
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).not.toHaveClass(/border-red/);
  });

  test('should handle special characters in input fields', async ({ page }) => {
    await openCreateProductModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Test with special characters
    const specialChars = '产品<script>alert(1)</script>&测试"\'';
    await nameInput.fill(specialChars);

    // Verify input accepts special characters
    const inputValue = await nameInput.inputValue();
    expect(inputValue).toBe(specialChars);

    // Verify counter counts correctly
    const nameCounter = page.locator('text=/\\d+\\/255/').first();
    await expect(nameCounter).toContainText(`${specialChars.length}/255`);
  });

  test('should handle emoji in input fields', async ({ page }) => {
    await openCreateProductModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Test with emoji
    const emojiText = '产品🎉测试🏆';
    await nameInput.fill(emojiText);

    // Verify input accepts emoji
    const inputValue = await nameInput.inputValue();
    expect(inputValue).toBe(emojiText);
  });
});

test.describe('Product Edit Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToProductManagement(page);
  });

  test('should open edit modal with existing data and character counters', async ({ page }) => {
    // Wait for product table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Click more options button on first row
    const moreButton = page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first();

    if (await moreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreButton.click();

      // Click edit option
      const editButton = page.locator('button:has-text("编辑")').first();
      await editButton.click();

      // Wait for edit modal to open
      await page.waitForSelector('text=编辑产品', { timeout: 5000 });

      // Verify character counter shows existing data length
      const nameInput = page.locator('input[name="name"]');
      const inputValue = await nameInput.inputValue();

      if (inputValue.length > 0) {
        const nameCounter = page.locator('text=/\\d+\\/255/').first();
        await expect(nameCounter).toContainText(`${inputValue.length}/255`);
      }
    }
  });
});
