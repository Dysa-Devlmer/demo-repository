import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for backend to be ready
    const backendUrl = process.env.API_URL || 'http://localhost:8005';
    let retries = 0;
    const maxRetries = 30;

    while (retries < maxRetries) {
      try {
        const response = await page.goto(`${backendUrl}/api/health`, {
          timeout: 5000,
        });
        if (response?.ok()) {
          console.log('✅ Backend is ready');
          break;
        }
      } catch {
        retries++;
        console.log(`⏳ Waiting for backend... (${retries}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (retries >= maxRetries) {
      throw new Error('Backend did not start in time');
    }

    // Pre-authenticate admin user for tests
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:7001';

    try {
      await page.goto(`${adminUrl}/login`);
      await page.waitForLoadState('networkidle');

      // Store auth state for reuse in tests
      await context.storageState({ path: './tests/.auth/admin.json' });
      console.log('✅ Admin auth state saved');
    } catch (error) {
      console.log('⚠️ Could not pre-authenticate (admin panel may not be running)');
    }

    console.log('✅ Global setup complete');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
