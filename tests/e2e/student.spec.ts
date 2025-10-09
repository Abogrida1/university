import { test, expect } from '@playwright/test';

test.describe('Student Features', () => {
  test('should display homepage with courses', async ({ page }) => {
    await page.goto('/');
    
    // Check if homepage loads
    await expect(page.locator('h1')).toContainText('منصة المواد الدراسية');
    await expect(page.locator('text=ابحث في الكورسات والمواد')).toBeVisible();
  });

  test('should filter courses by department', async ({ page }) => {
    await page.goto('/');
    
    // Select department
    await page.selectOption('select', 'dept1');
    
    // Wait for courses to load
    await page.waitForSelector('.grid');
    
    // Check if courses are displayed
    const courseCards = page.locator('.grid > div');
    await expect(courseCards).toHaveCount.greaterThan(0);
  });

  test('should search courses', async ({ page }) => {
    await page.goto('/');
    
    // Search for a course
    await page.fill('input[placeholder="ابحث في الكورسات والمواد..."]', 'برمجة');
    await page.press('input[placeholder="ابحث في الكورسات والمواد..."]', 'Enter');
    
    // Wait for search results
    await page.waitForSelector('.grid');
    
    // Check if search results are displayed
    const courseCards = page.locator('.grid > div');
    await expect(courseCards).toHaveCount.greaterThan(0);
  });

  test('should view course details', async ({ page }) => {
    await page.goto('/');
    
    // Click on first course
    const firstCourse = page.locator('.grid > div').first();
    await firstCourse.click();
    
    // Check if course page loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=المواد الدراسية')).toBeVisible();
  });

  test('should download materials', async ({ page }) => {
    await page.goto('/courses/1');
    
    // Wait for materials to load
    await page.waitForSelector('text=تحميل');
    
    // Click download button
    const downloadButton = page.locator('text=تحميل').first();
    await downloadButton.click();
    
    // Check if download starts (new tab opens or file downloads)
    // This test might need adjustment based on actual implementation
  });
});
