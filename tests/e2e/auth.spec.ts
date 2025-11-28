import { test, expect } from '@playwright/test';

test.describe('Authentication @critical', () => {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:7001';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${adminUrl}/login`);
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/ChatBotDysa|Login|Admin/i);

    // Check login form elements exist
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password|contraseña/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión|login|entrar/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill invalid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('invalid@test.com');
    await page.getByRole('textbox', { name: /password|contraseña/i }).fill('wrongpassword');

    // Click login button
    await page.getByRole('button', { name: /iniciar sesión|login|entrar/i }).click();

    // Wait for error message
    await expect(page.getByText(/credenciales|invalid|error|incorrectas/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill valid credentials (from .env or test data)
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@zgamersa.com';
    const password = process.env.TEST_ADMIN_PASSWORD || 'Admin123456';

    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByRole('textbox', { name: /password|contraseña/i }).fill(password);

    // Click login button
    await page.getByRole('button', { name: /iniciar sesión|login|entrar/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard|home|panel/i, { timeout: 15000 });
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@zgamersa.com';
    const password = process.env.TEST_ADMIN_PASSWORD || 'Admin123456';

    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByRole('textbox', { name: /password|contraseña/i }).fill(password);
    await page.getByRole('button', { name: /iniciar sesión|login|entrar/i }).click();

    // Wait for dashboard
    await page.waitForURL(/dashboard|home|panel/i, { timeout: 15000 });

    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout|salir/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try clicking user menu first
      const userMenu = page.getByRole('button', { name: /perfil|usuario|user/i });
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.getByRole('menuitem', { name: /cerrar sesión|logout|salir/i }).click();
      }
    }

    // Should redirect to login
    await expect(page).toHaveURL(/login/i, { timeout: 10000 });
  });
});
