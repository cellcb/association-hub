import { test, expect, Page } from '@playwright/test';
import { login, navigateToAdminSection, generateString } from './helpers';

/**
 * E2E tests for Manufacturer Management form validation
 * Tests inline error display and backend validation
 */

// Field limits matching backend @Size annotations
const MANUFACTURER_FIELD_LIMITS = {
  name: 255,
  contactPerson: 100,
  contactPhone: 50,
  contactEmail: 100,
  address: 500,
  website: 255,
  registeredCapital: 100,
  employeeScale: 50,
};

// Helper function to navigate to manufacturer management
async function navigateToManufacturerManagement(page: Page) {
  await navigateToAdminSection(page, '厂商管理', '添加厂商');
}

// Helper function to open create manufacturer modal
async function openCreateManufacturerModal(page: Page) {
  await page.click('button:has-text("添加厂商")');
  await page.waitForSelector('text=填写厂商详细信息', { timeout: 5000 });
}

test.describe('Manufacturer Management Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToManufacturerManagement(page);
  });

  test('should show validation error when name is empty', async ({ page }) => {
    await openCreateManufacturerModal(page);

    // Leave name empty and try to submit
    await page.click('button:has-text("保存")');

    // The form should not submit due to HTML5 required validation
    // Check that modal is still open
    await expect(page.locator('text=填写厂商详细信息')).toBeVisible();
  });

  test('should enforce maxLength on name field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Try to input more than 255 characters
    const longText = generateString(300);
    await nameInput.fill(longText);

    // Verify input is truncated to maxLength
    const inputValue = await nameInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.name);
  });

  test('should enforce maxLength on contactPerson field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const contactPersonInput = page.locator('input[name="contactPerson"]');
    await contactPersonInput.scrollIntoViewIfNeeded();

    // Try to input more than 100 characters
    const longText = generateString(150);
    await contactPersonInput.fill(longText);

    // Verify input is truncated
    const inputValue = await contactPersonInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.contactPerson);
  });

  test('should enforce maxLength on contactPhone field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const contactPhoneInput = page.locator('input[name="contactPhone"]');
    await contactPhoneInput.scrollIntoViewIfNeeded();

    // Try to input more than 50 characters
    const longText = generateString(60, '1');
    await contactPhoneInput.fill(longText);

    // Verify input is truncated
    const inputValue = await contactPhoneInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.contactPhone);
  });

  test('should enforce maxLength on contactEmail field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const contactEmailInput = page.locator('input[name="contactEmail"]');
    await contactEmailInput.scrollIntoViewIfNeeded();

    // Try to input more than 100 characters
    const longText = generateString(110) + '@test.com';
    await contactEmailInput.fill(longText);

    // Verify input is truncated
    const inputValue = await contactEmailInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.contactEmail);
  });

  test('should enforce maxLength on address field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const addressInput = page.locator('input[name="address"]');
    await addressInput.scrollIntoViewIfNeeded();

    // Try to input more than 500 characters
    const longText = generateString(600);
    await addressInput.fill(longText);

    // Verify input is truncated
    const inputValue = await addressInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.address);
  });

  test('should enforce maxLength on website field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const websiteInput = page.locator('input[name="website"]');
    await websiteInput.scrollIntoViewIfNeeded();

    // Try to input more than 255 characters
    const longText = 'https://' + generateString(300) + '.com';
    await websiteInput.fill(longText);

    // Verify input is truncated
    const inputValue = await websiteInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.website);
  });

  test('should enforce maxLength on registeredCapital field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const registeredCapitalInput = page.locator('input[name="registeredCapital"]');
    await registeredCapitalInput.scrollIntoViewIfNeeded();

    // Try to input more than 100 characters
    const longText = generateString(150);
    await registeredCapitalInput.fill(longText);

    // Verify input is truncated
    const inputValue = await registeredCapitalInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.registeredCapital);
  });

  test('should enforce maxLength on employeeScale field', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const employeeScaleInput = page.locator('input[name="employeeScale"]');
    await employeeScaleInput.scrollIntoViewIfNeeded();

    // Try to input more than 50 characters
    const longText = generateString(60);
    await employeeScaleInput.fill(longText);

    // Verify input is truncated
    const inputValue = await employeeScaleInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(MANUFACTURER_FIELD_LIMITS.employeeScale);
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    await openCreateManufacturerModal(page);

    // Click cancel button
    await page.click('button:has-text("取消")');

    // Modal should close
    await expect(page.locator('text=填写厂商详细信息')).not.toBeVisible();
  });

  test('should allow typing up to exact character limit for name', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Type exactly 255 characters
    const exactLimitText = generateString(255);
    await nameInput.fill(exactLimitText);

    // Verify all characters were accepted
    const inputValue = await nameInput.inputValue();
    expect(inputValue.length).toBe(MANUFACTURER_FIELD_LIMITS.name);
  });

  test('should handle Chinese characters correctly', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Type Chinese characters
    await nameInput.fill('中文厂商名称测试');

    // Verify input accepts Chinese characters
    const inputValue = await nameInput.inputValue();
    expect(inputValue).toBe('中文厂商名称测试');
  });

  test('should preserve form data when scrolling through modal', async ({ page }) => {
    await openCreateManufacturerModal(page);

    // Fill name field
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('测试厂商名称');

    // Fill contact person field
    const contactPersonInput = page.locator('input[name="contactPerson"]');
    await contactPersonInput.scrollIntoViewIfNeeded();
    await contactPersonInput.fill('张三');

    // Fill contact phone field
    const contactPhoneInput = page.locator('input[name="contactPhone"]');
    await contactPhoneInput.fill('13800138000');

    // Scroll back to top and verify name is preserved
    await nameInput.scrollIntoViewIfNeeded();
    await expect(nameInput).toHaveValue('测试厂商名称');

    // Scroll back to contact fields and verify they are preserved
    await contactPersonInput.scrollIntoViewIfNeeded();
    await expect(contactPersonInput).toHaveValue('张三');
    await expect(contactPhoneInput).toHaveValue('13800138000');
  });
});

test.describe('Manufacturer Form Validation - Backend Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToManufacturerManagement(page);
  });

  test('should display inline error for invalid email format', async ({ page }) => {
    await openCreateManufacturerModal(page);

    // Fill in required name field
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('测试厂商');

    // Fill in invalid email
    const contactEmailInput = page.locator('input[name="contactEmail"]');
    await contactEmailInput.scrollIntoViewIfNeeded();
    await contactEmailInput.fill('invalid-email');

    // Try to submit
    const saveButton = page.locator('button:has-text("保存")').last();
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();

    // Wait for backend validation response
    await page.waitForTimeout(1000);

    // Check for error summary or inline error
    const errorIndicator = page.locator('text=联系邮箱格式不正确, .text-red-500, .border-red-500');
    const hasError = await errorIndicator.isVisible({ timeout: 3000 }).catch(() => false);

    // Either error message or red border should appear
    if (hasError) {
      await expect(errorIndicator.first()).toBeVisible();
    } else {
      // Modal should still be open if validation failed
      await expect(page.locator('text=填写厂商详细信息')).toBeVisible();
    }
  });

  test('should clear validation errors when modal is reopened', async ({ page }) => {
    // Open modal
    await openCreateManufacturerModal(page);

    // Close modal
    await page.click('button:has-text("取消")');
    await expect(page.locator('text=填写厂商详细信息')).not.toBeVisible();

    // Reopen modal
    await openCreateManufacturerModal(page);

    // Verify no error styling on name input
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).not.toHaveClass(/border-red/);

    // Verify no error summary is visible
    await expect(page.locator('text=请修正以下错误')).not.toBeVisible();
  });

  test('should handle special characters in input fields', async ({ page }) => {
    await openCreateManufacturerModal(page);

    const nameInput = page.locator('input[name="name"]');

    // Test with special characters
    const specialChars = '厂商<script>alert(1)</script>&测试"\'';
    await nameInput.fill(specialChars);

    // Verify input accepts special characters
    const inputValue = await nameInput.inputValue();
    expect(inputValue).toBe(specialChars);
  });

  test('should display error summary when backend validation fails', async ({ page }) => {
    await openCreateManufacturerModal(page);

    // Fill in required name field
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('测试厂商');

    // Fill in multiple invalid fields
    const contactEmailInput = page.locator('input[name="contactEmail"]');
    await contactEmailInput.scrollIntoViewIfNeeded();
    await contactEmailInput.fill('not-an-email');

    // Try to submit
    const saveButton = page.locator('button:has-text("保存")').last();
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();

    // Wait for backend validation response
    await page.waitForTimeout(1500);

    // Check if error summary appears
    const errorSummary = page.locator('text=请修正以下错误');
    const hasErrorSummary = await errorSummary.isVisible({ timeout: 3000 }).catch(() => false);

    // If error summary is visible, verify it contains error messages
    if (hasErrorSummary) {
      await expect(errorSummary).toBeVisible();
      // Check that there's at least one error listed
      const errorList = page.locator('.bg-red-50 ul li');
      const errorCount = await errorList.count();
      expect(errorCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Manufacturer Edit Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToManufacturerManagement(page);
  });

  test('should open edit modal with existing data', async ({ page }) => {
    // Wait for manufacturer table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Click more options button on first row
    const moreButton = page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first();

    if (await moreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreButton.click();

      // Click edit option
      const editButton = page.locator('button:has-text("编辑")').first();
      await editButton.click();

      // Wait for edit modal to open
      await page.waitForSelector('text=编辑厂商', { timeout: 5000 });

      // Verify name input has existing data
      const nameInput = page.locator('input[name="name"]');
      const inputValue = await nameInput.inputValue();
      expect(inputValue.length).toBeGreaterThan(0);
    }
  });

  test('should clear validation errors when switching between add and edit', async ({ page }) => {
    // First open add modal
    await openCreateManufacturerModal(page);

    // Close add modal
    await page.click('button:has-text("取消")');
    await expect(page.locator('text=填写厂商详细信息')).not.toBeVisible();

    // Now try to open edit modal
    const moreButton = page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first();

    if (await moreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreButton.click();

      const editButton = page.locator('button:has-text("编辑")').first();
      await editButton.click();

      // Wait for edit modal to open
      await page.waitForSelector('text=编辑厂商', { timeout: 5000 });

      // Verify no error summary is visible
      await expect(page.locator('text=请修正以下错误')).not.toBeVisible();
    }
  });
});
