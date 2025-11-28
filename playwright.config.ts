import { defineConfig, devices } from '@playwright/test';

/**
 * DysaBot Enterprise E2E Testing Configuration
 * 
 * This configuration supports:
 * - Multi-browser testing (Chrome, Firefox, Safari)
 * - Mobile device emulation
 * - Cross-platform testing
 * - Enterprise security features
 * - Performance testing
 * - Visual regression testing
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Global test timeout
  timeout: 30 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 10 * 1000,
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    // HTML reporter for local development
    ['html', { outputFolder: 'test-results/html' }],
    
    // JUnit reporter for CI/CD integration
    ['junit', { outputFile: 'test-results/junit.xml' }],
    
    // JSON reporter for custom processing
    ['json', { outputFile: 'test-results/results.json' }],
    
    // Custom enterprise reporter
    ['./tests/utils/enterprise-reporter.ts']
  ],
  
  // Global test configuration
  use: {
    // Base URL
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3001',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Enterprise security headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Test-Environment': 'e2e',
    },
  },
  
  // Test projects for different browsers and devices
  projects: [
    // Desktop Browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/chromium',
            size: { width: 1920, height: 1080 }
          }
        }
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/firefox',
            size: { width: 1920, height: 1080 }
          }
        }
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/webkit',
            size: { width: 1920, height: 1080 }
          }
        }
      },
    },
    
    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/mobile-chrome',
            size: { width: 393, height: 851 }
          }
        }
      },
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/mobile-safari',
            size: { width: 390, height: 844 }
          }
        }
      },
    },
    
    // Tablet devices
    {
      name: 'iPad',
      use: { 
        ...devices['iPad Pro'],
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/ipad',
            size: { width: 1024, height: 1366 }
          }
        }
      },
    },
    
    // High DPI displays
    {
      name: 'High DPI',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/high-dpi',
            size: { width: 1920, height: 1080 }
          }
        }
      },
    },
    
    // Performance testing project
    {
      name: 'Performance',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/performance',
            size: { width: 1920, height: 1080 }
          }
        }
      },
      testMatch: /.*\.perf\.spec\.ts/,
    },
    
    // Visual regression testing
    {
      name: 'Visual',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/visual',
            size: { width: 1920, height: 1080 }
          }
        }
      },
      testMatch: /.*\.visual\.spec\.ts/,
    },
  ],
  
  // Web Server configuration for local testing
  webServer: process.env.CI ? undefined : [
    {
      command: 'npm run dev:backend',
      url: 'http://127.0.0.1:8005',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        PORT: '8005',
        DATABASE_HOST: '127.0.0.1',
        DATABASE_PORT: '15432',
        DATABASE_USER: 'postgres',
        DATABASE_PASSWORD: 'supersecret',
        DATABASE_NAME: 'chatbotdysa_test',
        NODE_ENV: 'test'
      }
    },
    {
      command: 'npm run dev:admin',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
  
  // Output directory
  outputDir: 'test-results/artifacts',
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown'),
});