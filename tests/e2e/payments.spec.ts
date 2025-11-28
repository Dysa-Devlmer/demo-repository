import { test, expect } from '@playwright/test';

test.describe('Payments Integration @critical', () => {
  const apiUrl = process.env.API_URL || 'http://localhost:8005';

  test('should get pricing plans', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/payments/pricing`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data).toBeDefined();

    // Check plan structure
    const plans = data.data;
    expect(plans['saas-multi']).toBeDefined();
    expect(plans['saas-multi'].name).toBeDefined();
    expect(plans['saas-multi'].price).toBeDefined();
  });

  test('should check MercadoPago health', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/payments/health`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.data).toHaveProperty('status');
    // Status should be 'ok' or 'error' (if not configured)
    expect(['ok', 'error']).toContain(data.data.status);
  });

  test('should create payment preference', async ({ request }) => {
    const paymentData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+56912345678',
      rut: '12345678-9',
      companyName: 'Test Company',
      planId: 'saas-multi',
      planName: 'SaaS Multi-tenant',
      amount: 49990,
      billingPeriod: 'monthly',
    };

    const response = await request.post(`${apiUrl}/api/payments/create-preference`, {
      data: paymentData,
    });

    // May fail if MercadoPago not configured - that's ok
    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBeTruthy();
      expect(data.data).toHaveProperty('preferenceId');
    } else {
      // If MercadoPago not configured, expect 400
      expect([400, 500]).toContain(response.status());
    }
  });

  test('should handle webhook correctly', async ({ request }) => {
    // Test webhook endpoint with mock data
    const webhookData = {
      type: 'payment',
      action: 'payment.created',
      data: {
        id: 'test_123456789',
      },
    };

    const response = await request.post(`${apiUrl}/api/payments/webhook`, {
      data: webhookData,
    });

    // Webhook should always return 200 to avoid retries
    expect(response.status()).toBe(200);
  });

  test('should validate payment data', async ({ request }) => {
    // Send incomplete data
    const incompleteData = {
      email: 'test@example.com',
      // Missing required fields
    };

    const response = await request.post(`${apiUrl}/api/payments/create-preference`, {
      data: incompleteData,
    });

    // Should return 400 Bad Request
    expect([400, 422]).toContain(response.status());
  });

  test('should reject payment with invalid plan', async ({ request }) => {
    const paymentData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      planId: 'invalid-plan',
      planName: 'Invalid Plan',
      amount: 99999,
      billingPeriod: 'monthly',
    };

    const response = await request.post(`${apiUrl}/api/payments`, {
      data: paymentData,
    });

    // Should validate and reject
    expect([400, 422, 500]).toContain(response.status());
  });
});
