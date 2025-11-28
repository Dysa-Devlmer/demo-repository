import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...');

  try {
    // Clean up auth state files
    const authDir = path.join(__dirname, '.auth');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
      console.log('✅ Auth state cleaned up');
    }

    // Clean up any test data if needed
    // This is where you would call API endpoints to reset test data

    console.log('✅ Global teardown complete');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - teardown should not fail the tests
  }
}

export default globalTeardown;
