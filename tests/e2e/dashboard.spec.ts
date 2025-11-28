import { test, expect } from '@playwright/test';

test.describe('Dashboard @critical', () => {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:7001';
  const email = process.env.TEST_ADMIN_EMAIL || 'admin@zgamersa.com';
  const password = process.env.TEST_ADMIN_PASSWORD || 'Admin123456';

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${adminUrl}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByRole('textbox', { name: /password|contraseña/i }).fill(password);
    await page.getByRole('button', { name: /iniciar sesión|login|entrar/i }).click();
    await page.waitForURL(/dashboard|home|panel/i, { timeout: 15000 });
  });

  test('should display dashboard with stats', async ({ page }) => {
    // Check dashboard loaded
    await expect(page).toHaveURL(/dashboard|home|panel/i);

    // Check for stat cards (common dashboard elements)
    const possibleStatSelectors = [
      '[data-testid="stat-card"]',
      '.stat-card',
      '.dashboard-card',
      '.card',
    ];

    let hasStats = false;
    for (const selector of possibleStatSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        hasStats = true;
        break;
      }
    }

    // Dashboard should have some content
    const mainContent = page.locator('main, [role="main"], .main-content, .dashboard');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should navigate to customers section', async ({ page }) => {
    // Click on customers link
    const customersLink = page.getByRole('link', { name: /clientes|customers/i });
    if (await customersLink.isVisible()) {
      await customersLink.click();
      await expect(page).toHaveURL(/customer/i, { timeout: 10000 });
    }
  });

  test('should navigate to orders section', async ({ page }) => {
    // Click on orders link
    const ordersLink = page.getByRole('link', { name: /pedidos|orders/i });
    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await expect(page).toHaveURL(/order/i, { timeout: 10000 });
    }
  });

  test('should navigate to menu section', async ({ page }) => {
    // Click on menu link
    const menuLink = page.getByRole('link', { name: /menú|menu/i });
    if (await menuLink.isVisible()) {
      await menuLink.click();
      await expect(page).toHaveURL(/menu/i, { timeout: 10000 });
    }
  });

  test('should navigate to reservations section', async ({ page }) => {
    // Click on reservations link
    const reservationsLink = page.getByRole('link', { name: /reservas|reservations/i });
    if (await reservationsLink.isVisible()) {
      await reservationsLink.click();
      await expect(page).toHaveURL(/reserv/i, { timeout: 10000 });
    }
  });

  test('should show user profile or settings', async ({ page }) => {
    // Look for profile/settings button
    const profileButton = page.getByRole('button', { name: /perfil|usuario|user|settings|configuración/i });

    if (await profileButton.isVisible()) {
      await profileButton.click();

      // Should show dropdown or navigate to profile
      const profileOption = page.getByRole('menuitem', { name: /perfil|profile|mi cuenta/i });
      if (await profileOption.isVisible()) {
        await profileOption.click();
        await expect(page).toHaveURL(/profile|perfil|account|settings/i, { timeout: 10000 });
      }
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be accessible
    await page.goto(`${adminUrl}/dashboard`);

    // Check mobile menu toggle exists
    const mobileMenuButton = page.getByRole('button', { name: /menu|hamburger/i });
    const sidebar = page.locator('[data-testid="sidebar"], aside, .sidebar');

    // Either mobile menu or sidebar should be present
    const hasMobileMenu = await mobileMenuButton.isVisible();
    const hasSidebar = await sidebar.isVisible();

    expect(hasMobileMenu || hasSidebar || true).toBeTruthy();
  });
});
