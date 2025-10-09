import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Login as admin
    await page.fill('input[name="email"]', 'admin@university.edu');
    await page.fill('input[name="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/');
  });

  test('should display admin panel', async ({ page }) => {
    await page.goto('/admin');
    
    // Check if admin panel is visible
    await expect(page.locator('h1')).toContainText('لوحة الإدارة');
    await expect(page.locator('text=إجمالي الكورسات')).toBeVisible();
    await expect(page.locator('text=إجمالي المواد')).toBeVisible();
  });

  test('should allow uploading materials', async ({ page }) => {
    await page.goto('/courses/1');
    
    // Click on upload tab
    await page.click('text=رفع مادة جديدة');
    
    // Fill upload form
    await page.selectOption('select', 'pdf');
    await page.fill('input[placeholder="أدخل عنوان المادة"]', 'ملف تجريبي');
    
    // Upload a test file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for success message or new material
    await expect(page.locator('text=تم رفع المادة بنجاح')).toBeVisible();
  });
});
