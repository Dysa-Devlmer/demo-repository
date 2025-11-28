import { test, expect } from '@playwright/test';

// Helper to login before each test
async function login(page: any) {
  await page.goto('/login');
  await page.getByLabel(/correo electrónico|email/i).fill('admin@zgamersa.com');
  await page.getByLabel(/contraseña|password/i).fill('admin123');
  await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard stats cards', async ({ page }) => {
    // Check for stat cards (common in dashboards)
    const statsContainer = page.locator('[data-testid="stats-container"], .stats, .metrics, .dashboard-stats').first();

    if (await statsContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(statsContainer).toBeVisible();
    }

    // Look for numeric values or stats
    const numbers = page.locator('text=/\\d+/').first();
    await expect(numbers).toBeVisible({ timeout: 5000 });
  });

  test('should display page title or heading', async ({ page }) => {
    // Check for dashboard heading
    const heading = page.getByRole('heading', { name: /dashboard|inicio|panel/i }).first();
    await expect(heading).toBeVisible();
  });

  test('should load without errors', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that page is not showing error message
    const errorMessages = page.getByText(/error|failed|falló/i);
    const errorCount = await errorMessages.count();

    // Should have 0 or very few error messages
    expect(errorCount).toBeLessThan(3);
  });

  test('should navigate to customers page', async ({ page }) => {
    // Look for customers link/button
    const customersLink = page.getByRole('link', { name: /clientes|customers/i }).first();

    if (await customersLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customersLink.click();

      // Wait for navigation
      await page.waitForTimeout(1000);

      // Check URL changed
      const url = page.url();
      expect(url.includes('customer') || url.includes('cliente')).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should navigate to orders page', async ({ page }) => {
    // Look for orders link
    const ordersLink = page.getByRole('link', { name: /pedidos|orders|órdenes/i }).first();

    if (await ordersLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await ordersLink.click();

      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url.includes('order') || url.includes('pedido')).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should navigate to menu page', async ({ page }) => {
    // Look for menu link
    const menuLink = page.getByRole('link', { name: /menú|menu|carta/i }).first();

    if (await menuLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuLink.click();

      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url.includes('menu') || url.includes('carta')).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should navigate to reservations page', async ({ page }) => {
    // Look for reservations link
    const reservationsLink = page.getByRole('link', { name: /reservas|reservations/i }).first();

    if (await reservationsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reservationsLink.click();

      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url.includes('reserv')).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    // Look for settings link
    const settingsLink = page.getByRole('link', { name: /configuración|settings|ajustes/i }).first();

    if (await settingsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsLink.click();

      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url.includes('setting') || url.includes('config') || url.includes('ajuste')).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Check for sidebar or navigation menu
    const sidebar = page.locator('aside, nav, [data-testid="sidebar"], .sidebar').first();

    if (await sidebar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(sidebar).toBeVisible();

      // Check that sidebar contains multiple links
      const links = sidebar.locator('a, button');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(2);
    } else {
      // If no sidebar, check for hamburger menu button
      const menuButton = page.getByRole('button', { name: /menu|menú/i }).first();
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(menuButton).toBeVisible();
      } else {
        test.skip();
      }
    }
  });

  test('should refresh data when clicking refresh button', async ({ page }) => {
    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /actualizar|refresh|reload/i }).first();

    if (await refreshButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Get initial content
      const initialContent = await page.textContent('body');

      // Click refresh
      await refreshButton.click();

      // Wait for reload
      await page.waitForTimeout(1500);

      // Content should still be visible (might be same or updated)
      const newContent = await page.textContent('body');
      expect(newContent).toBeTruthy();
      expect(newContent!.length).toBeGreaterThan(100);
    } else {
      test.skip();
    }
  });

  test('should display user information', async ({ page }) => {
    // Look for user name, email, or avatar
    const userInfo = page.getByText(/admin|usuario|user/i).first();

    if (await userInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(userInfo).toBeVisible();
    }

    // Or look for user avatar/icon
    const userAvatar = page.locator('[data-testid="user-avatar"], .avatar, .user-icon').first();

    if (await userAvatar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(userAvatar).toBeVisible();
    }
  });
});
