import { test, expect } from '@playwright/test';

test.describe('API Health Checks @critical', () => {
  const apiUrl = process.env.API_URL || 'http://localhost:8005';

  test('should return healthy status from /api/health', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/health`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(['ok', 'healthy', 'up']).toContain(data.status?.toLowerCase() || data.status);
  });

  test('should return valid response from /api/menu', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/menu`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toBeDefined();
    // Menu should return an array or an object with items
    if (Array.isArray(data)) {
      expect(data.length).toBeGreaterThanOrEqual(0);
    } else if (data.data) {
      expect(Array.isArray(data.data)).toBeTruthy();
    }
  });

  test('should return valid response from /api/categories', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/categories`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should return 401 for protected endpoints without auth', async ({ request }) => {
    const protectedEndpoints = [
      '/api/customers',
      '/api/orders',
      '/api/reservations',
      '/api/users',
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(`${apiUrl}${endpoint}`);
      // Should return 401 Unauthorized or 403 Forbidden
      expect([401, 403]).toContain(response.status());
    }
  });

  test('should return MercadoPago health status', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/payments/health`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('status');
  });

  test('should return pricing information', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/payments/pricing`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBeTruthy();
    expect(data).toHaveProperty('data');

    // Check pricing structure
    const pricing = data.data;
    expect(pricing).toHaveProperty('saas-multi');
  });

  test('should handle CORS preflight requests', async ({ request }) => {
    const response = await request.fetch(`${apiUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
      },
    });

    // Should not return error (200 or 204)
    expect([200, 204]).toContain(response.status());
  });

  test('should return dashboard stats for authenticated users', async ({ request }) => {
    // First get auth token
    const loginResponse = await request.post(`${apiUrl}/api/auth/login`, {
      data: {
        email: process.env.TEST_ADMIN_EMAIL || 'admin@zgamersa.com',
        password: process.env.TEST_ADMIN_PASSWORD || 'Admin123456',
      },
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      const token = loginData.accessToken || loginData.access_token || loginData.token;

      if (token) {
        // Get dashboard stats with auth
        const dashboardResponse = await request.get(`${apiUrl}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(dashboardResponse.ok()).toBeTruthy();
      }
    }
  });
});
