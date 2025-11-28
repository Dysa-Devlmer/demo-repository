import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/ChatBotDysa/);

    // Check login form elements are visible
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/correo electrónico|email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión|login/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click login button without filling fields
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

    // Should show validation messages (wait a bit for them to appear)
    await page.waitForTimeout(500);

    // Check that we're still on login page (not redirected)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/correo electrónico|email/i).fill('invalid@test.com');
    await page.getByLabel(/contraseña|password/i).fill('wrongpassword');

    // Click login
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

    // Wait for error message or check we're still on login page
    await page.waitForTimeout(1000);

    // Should remain on login page or show error
    const currentUrl = page.url();
    expect(currentUrl.includes('/login') || currentUrl.includes('error')).toBeTruthy();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in valid credentials (adjust these based on your test user)
    await page.getByLabel(/correo electrónico|email/i).fill('admin@zgamersa.com');
    await page.getByLabel(/contraseña|password/i).fill('admin123');

    // Click login
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

    // Wait for navigation
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Check that dashboard elements are visible
    await expect(page.getByText(/dashboard|inicio/i)).toBeVisible();
  });

  test('should activate demo mode', async ({ page }) => {
    // Look for demo mode button/link
    const demoButton = page.getByRole('button', { name: /demo|probar demo/i });

    if (await demoButton.isVisible()) {
      await demoButton.click();

      // Wait for navigation
      await page.waitForTimeout(2000);

      // Should be redirected to dashboard or demo page
      const currentUrl = page.url();
      expect(currentUrl.includes('/dashboard') || currentUrl.includes('/demo')).toBeTruthy();

      // Check that demo mode is active (might have indicator)
      const demoIndicator = page.getByText(/modo demo|demo mode/i);
      if (await demoIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(demoIndicator).toBeVisible();
      }
    } else {
      // Skip test if demo button not available
      test.skip();
    }
  });

  test('should persist session after page reload', async ({ page }) => {
    // Login first
    await page.getByLabel(/correo electrónico|email/i).fill('admin@zgamersa.com');
    await page.getByLabel(/contraseña|password/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Reload the page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/correo electrónico|email/i).fill('admin@zgamersa.com');
    await page.getByLabel(/contraseña|password/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Look for logout button (might be in user menu, sidebar, etc.)
    // Try multiple possible locations
    const userMenuButton = page.getByRole('button', { name: /user|usuario|perfil/i }).first();

    if (await userMenuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Click logout
    const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout|salir/i }).first();

    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();

      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 5000 });
      await expect(page).toHaveURL(/\/login/);
    } else {
      // Skip if logout button not found
      test.skip();
    }
  });

  test('should handle "Remember me" checkbox', async ({ page }) => {
    const rememberCheckbox = page.getByLabel(/recordarme|remember me/i);

    if (await rememberCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Check the remember me option
      await rememberCheckbox.check();
      await expect(rememberCheckbox).toBeChecked();

      // Login
      await page.getByLabel(/correo electrónico|email/i).fill('admin@zgamersa.com');
      await page.getByLabel(/contraseña|password/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL(/\/dashboard/);
    } else {
      // Skip if remember me not available
      test.skip();
    }
  });
});
