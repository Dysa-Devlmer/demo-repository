import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { api, apiService } from '../api';

// Create a mock adapter for axios
const mock = new MockAdapter(api);

describe('API Module', () => {
  // Store original localStorage
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    // Reset mock adapter
    mock.reset();

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  describe('API Configuration', () => {
    it('should create axios instance with correct baseURL', () => {
      expect(api.defaults.baseURL).toContain('/api');
    });

    it('should have 10 second timeout', () => {
      expect(api.defaults.timeout).toBe(10000);
    });

    it('should have JSON content type header', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Request Interceptor - Authentication', () => {
    beforeEach(() => {
      // Mock successful response
      mock.onGet('/test').reply(200, { success: true });
    });

    it('should add Bearer token in normal mode', async () => {
      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'test-jwt-token';
        if (key === 'demo_mode') return 'false';
        return null;
      });

      await api.get('/test');

      // Check that request was made with Bearer token
      expect(mock.history.get[0].headers?.Authorization).toBe('Bearer test-jwt-token');
    });

    it('should add Demo token in demo mode', async () => {
      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_token') return 'demo-12345';
        if (key === 'demo_mode') return 'true';
        return null;
      });

      await api.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBe('Demo demo-12345');
      expect(mock.history.get[0].headers?.['x-demo-token']).toBe('demo-12345');
    });

    it('should prioritize demo token when demo mode is enabled', async () => {
      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'jwt-token';
        if (key === 'demo_token') return 'demo-token';
        if (key === 'demo_mode') return 'true';
        return null;
      });

      await api.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBe('Demo demo-token');
      expect(mock.history.get[0].headers?.Authorization).not.toContain('Bearer');
    });

    it('should make request without auth when no tokens present', async () => {
      (global.localStorage.getItem as jest.Mock).mockReturnValue(null);

      await api.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
    });

    it('should handle demo mode=false string correctly', async () => {
      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'jwt-token';
        if (key === 'demo_mode') return 'false';
        return null;
      });

      await api.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBe('Bearer jwt-token');
    });
  });

  describe('Response Interceptor - Data Extraction', () => {
    it('should extract direct array response', async () => {
      const directArray = [{ id: 1 }, { id: 2 }];
      mock.onGet('/test').reply(200, directArray);

      const response = await api.get('/test');

      expect(response.data).toEqual(directArray);
    });

    it('should extract nested data structure {data: {data: []}}', async () => {
      const nestedData = {
        data: {
          data: [{ id: 1 }, { id: 2 }],
          pagination: { total: 2 }
        }
      };
      mock.onGet('/test').reply(200, nestedData);

      const response = await api.get('/test');

      expect(response.data).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should extract simple data structure {data: []}', async () => {
      const simpleData = {
        data: [{ id: 1 }, { id: 2 }]
      };
      mock.onGet('/test').reply(200, simpleData);

      const response = await api.get('/test');

      expect(response.data).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should return non-array response as-is', async () => {
      const objectResponse = { id: 1, name: 'Test' };
      mock.onGet('/test').reply(200, objectResponse);

      const response = await api.get('/test');

      expect(response.data).toEqual(objectResponse);
    });

    it('should handle null response', async () => {
      mock.onGet('/test').reply(200, null);

      const response = await api.get('/test');

      expect(response.data).toBeNull();
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    it('should clear auth token on 401 in normal mode', async () => {
      mock.onGet('/test').reply(401);

      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_mode') return 'false';
        return null;
      });

      try {
        await api.get('/test');
      } catch (error) {
        // Expected to throw
      }

      expect(global.localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should NOT clear auth token on 401 in demo mode', async () => {
      mock.onGet('/test').reply(401);

      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_mode') return 'true';
        return null;
      });

      try {
        await api.get('/test');
      } catch (error) {
        // Expected to throw
      }

      expect(global.localStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should throw error on 401', async () => {
      mock.onGet('/test').reply(401);

      await expect(api.get('/test')).rejects.toThrow();
    });

    it('should throw error on 500', async () => {
      mock.onGet('/test').reply(500);

      await expect(api.get('/test')).rejects.toThrow();
    });

    it('should throw error on network failure', async () => {
      mock.onGet('/test').networkError();

      await expect(api.get('/test')).rejects.toThrow();
    });
  });

  describe('API Service - Health Check', () => {
    it('should call health endpoint', async () => {
      mock.onGet('/health').reply(200, { status: 'ok' });

      const response = await apiService.health();

      expect(response.data.status).toBe('ok');
    });

    it('should return demo data on 404', async () => {
      mock.onGet('/health').reply(404);

      const response = await apiService.health();

      expect(response.data.status).toBe('ok');
      expect(response.data.timestamp).toBeDefined();
    });

    it('should return demo data on network error', async () => {
      mock.onGet('/health').networkError();

      const response = await apiService.health();

      expect(response.data.status).toBe('ok');
      expect(response.data.timestamp).toBeDefined();
    });
  });

  describe('API Service - Dashboard Stats', () => {
    it('should fetch dashboard stats', async () => {
      const stats = {
        totalConversations: 100,
        activeCustomers: 50,
        totalOrders: 25,
        revenue: 5000
      };
      mock.onGet('/dashboard/stats').reply(200, stats);

      const response = await apiService.getDashboardStats();

      expect(response.data).toEqual(stats);
    });

    it('should return demo stats on error', async () => {
      mock.onGet('/dashboard/stats').reply(404);

      const response = await apiService.getDashboardStats();

      expect(response.data.totalConversations).toBeDefined();
      expect(response.data.activeCustomers).toBeDefined();
      expect(response.data.totalOrders).toBeDefined();
      expect(response.data.revenue).toBeDefined();
    });
  });

  describe('API Service - Menu Management', () => {
    it('should get all menu items', async () => {
      mock.onGet('/menu').reply(404);

      const response = await apiService.menu.getAll();

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('should get menu item by id', async () => {
      mock.onGet('/menu/1').reply(200, { id: 1, name: 'Pasta' });

      const response = await apiService.menu.getById('1');

      expect(response.data.id).toBe(1);
    });

    it('should create menu item', async () => {
      const newItem = { name: 'Pizza', price: 12.50 };
      mock.onPost('/menu').reply(201, { id: 1, ...newItem });

      const response = await apiService.menu.create(newItem);

      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('Pizza');
    });

    it('should update menu item', async () => {
      const updatedItem = { name: 'Pizza Supreme', price: 15.00 };
      mock.onPut('/menu/1').reply(200, { id: 1, ...updatedItem });

      const response = await apiService.menu.update('1', updatedItem);

      expect(response.data.name).toBe('Pizza Supreme');
    });

    it('should delete menu item', async () => {
      mock.onDelete('/menu/1').reply(204);

      const response = await apiService.menu.delete('1');

      expect(response.status).toBe(204);
    });
  });

  describe('API Service - Orders Management', () => {
    it('should get all orders with demo fallback', async () => {
      mock.onGet('/orders').reply(404);

      const response = await apiService.orders.getAll();

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('should get orders with query params', async () => {
      mock.onGet('/orders', { params: { status: 'completed' } }).reply(200, []);

      await apiService.orders.getAll({ status: 'completed' });

      expect(mock.history.get[0].params).toEqual({ status: 'completed' });
    });

    it('should get order by id', async () => {
      mock.onGet('/orders/1').reply(200, { id: 1, total: 45.50 });

      const response = await apiService.orders.getById(1);

      expect(response.data.id).toBe(1);
    });

    it('should update order status', async () => {
      mock.onPatch('/orders/1/status').reply(200, { id: 1, status: 'delivered' });

      const response = await apiService.orders.updateStatus(1, 'delivered');

      expect(response.data.status).toBe('delivered');
    });

    it('should create order', async () => {
      const newOrder = { items: ['Pizza'], total: 12.50 };
      mock.onPost('/orders').reply(201, { id: 1, ...newOrder });

      const response = await apiService.orders.create(newOrder);

      expect(response.data.id).toBe(1);
    });
  });

  describe('API Service - Reservations Management', () => {
    it('should get all reservations with demo fallback', async () => {
      mock.onGet('/reservations').reply(404);

      const response = await apiService.reservations.getAll();

      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get reservation by id', async () => {
      mock.onGet('/reservations/1').reply(200, { id: 1, guests: 4 });

      const response = await apiService.reservations.getById(1);

      expect(response.data.guests).toBe(4);
    });

    it('should create reservation', async () => {
      const newReservation = { date: '2025-09-22', guests: 4 };
      mock.onPost('/reservations').reply(201, { id: 1, ...newReservation });

      const response = await apiService.reservations.create(newReservation);

      expect(response.data.id).toBe(1);
    });

    it('should update reservation', async () => {
      const updated = { guests: 6 };
      mock.onPut('/reservations/1').reply(200, { id: 1, ...updated });

      const response = await apiService.reservations.update(1, updated);

      expect(response.data.guests).toBe(6);
    });

    it('should update reservation status', async () => {
      mock.onPatch('/reservations/1/status').reply(200, { id: 1, status: 'confirmed' });

      const response = await apiService.reservations.updateStatus(1, 'confirmed');

      expect(response.data.status).toBe('confirmed');
    });

    it('should delete reservation', async () => {
      mock.onDelete('/reservations/1').reply(204);

      const response = await apiService.reservations.delete(1);

      expect(response.status).toBe(204);
    });
  });

  describe('API Service - Customers Management', () => {
    it('should get all customers with demo fallback', async () => {
      mock.onGet('/customers').reply(404);

      const response = await apiService.customers.getAll();

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data[0]).toHaveProperty('name');
    });

    it('should get customer by id', async () => {
      mock.onGet('/customers/1').reply(200, { id: 1, name: 'John Doe' });

      const response = await apiService.customers.getById(1);

      expect(response.data.name).toBe('John Doe');
    });

    it('should create customer', async () => {
      const newCustomer = { name: 'Jane Doe', phone: '+123456789' };
      mock.onPost('/customers').reply(201, { id: 1, ...newCustomer });

      const response = await apiService.customers.create(newCustomer);

      expect(response.data.name).toBe('Jane Doe');
    });

    it('should update customer', async () => {
      const updated = { name: 'Jane Smith' };
      mock.onPut('/customers/1').reply(200, { id: 1, ...updated });

      const response = await apiService.customers.update(1, updated);

      expect(response.data.name).toBe('Jane Smith');
    });

    it('should delete customer', async () => {
      mock.onDelete('/customers/1').reply(204);

      const response = await apiService.customers.delete(1);

      expect(response.status).toBe(204);
    });
  });

  describe('API Service - Conversations Management', () => {
    it('should get all conversations with demo fallback', async () => {
      mock.onGet('/conversations').reply(404);

      const response = await apiService.conversations.getAll();

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data[0]).toHaveProperty('customer');
    });

    it('should get conversation by id', async () => {
      mock.onGet('/conversations/1').reply(200, { id: 1, customer: 'John' });

      const response = await apiService.conversations.getById(1);

      expect(response.data.customer).toBe('John');
    });

    it('should get conversation messages', async () => {
      mock.onGet('/conversations/1/messages').reply(200, [{ id: 1, text: 'Hello' }]);

      const response = await apiService.conversations.getMessages(1);

      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should send message', async () => {
      mock.onPost('/conversations/1/messages').reply(201, { id: 1, text: 'Hello' });

      const response = await apiService.conversations.sendMessage(1, 'Hello');

      expect(response.data.text).toBe('Hello');
    });
  });

  describe('API Service - Settings Management', () => {
    it('should get settings with demo fallback', async () => {
      mock.onGet('/settings').reply(404);

      const response = await apiService.settings.get();

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.some((s: any) => s.key === 'restaurant_name')).toBe(true);
    });

    it('should update settings', async () => {
      const settings = { restaurant_name: 'New Name' };
      mock.onPut('/settings').reply(200, settings);

      const response = await apiService.settings.update(settings);

      expect(response.data.restaurant_name).toBe('New Name');
    });

    it('should get restaurant info', async () => {
      mock.onGet('/settings/restaurant').reply(200, { name: 'Test Restaurant' });

      const response = await apiService.settings.getRestaurantInfo();

      expect(response.data.name).toBe('Test Restaurant');
    });

    it('should update restaurant info', async () => {
      const info = { name: 'Updated Restaurant' };
      mock.onPut('/settings/restaurant').reply(200, info);

      const response = await apiService.settings.updateRestaurantInfo(info);

      expect(response.data.name).toBe('Updated Restaurant');
    });

    it('should test WhatsApp with demo fallback', async () => {
      mock.onPost('/settings/test/whatsapp').reply(404);

      const response = await apiService.settings.testWhatsApp({ phoneNumber: '+123456789' });

      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('Demo');
      expect(response.data.testResults).toBeDefined();
    });
  });

  describe('API Service - AI Management', () => {
    it('should send chat message', async () => {
      const message = 'Hello AI';
      mock.onPost('/ai/chat').reply(200, { response: 'Hi there!' });

      const response = await apiService.ai.chat(message);

      expect(response.data.response).toBe('Hi there!');
    });

    it('should send chat with context', async () => {
      mock.onPost('/ai/chat').reply(200, { response: 'Context received' });

      const response = await apiService.ai.chat('Hello', { userId: 1 });

      expect(mock.history.post[0].data).toContain('userId');
    });

    it('should get available models', async () => {
      mock.onGet('/ai/models').reply(200, ['gpt-4', 'gpt-3.5']);

      const response = await apiService.ai.getModels();

      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should set AI model', async () => {
      mock.onPost('/ai/model').reply(200, { model: 'gpt-4' });

      const response = await apiService.ai.setModel('gpt-4');

      expect(response.data.model).toBe('gpt-4');
    });
  });

  describe('Smart API Call - Error Handling', () => {
    it('should throw non-404 errors', async () => {
      mock.onGet('/dashboard/stats').reply(500, { error: 'Server error' });

      await expect(apiService.getDashboardStats()).rejects.toThrow();
    });

    it('should throw 401 errors', async () => {
      mock.onGet('/dashboard/stats').reply(401);

      await expect(apiService.getDashboardStats()).rejects.toThrow();
    });

    it('should throw 403 errors', async () => {
      mock.onGet('/dashboard/stats').reply(403);

      await expect(apiService.getDashboardStats()).rejects.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete order flow', async () => {
      // Get orders
      mock.onGet('/orders').reply(200, [{ id: 1, status: 'pending' }]);
      const ordersResponse = await apiService.orders.getAll();
      expect(ordersResponse.data[0].status).toBe('pending');

      // Update order status
      mock.onPatch('/orders/1/status').reply(200, { id: 1, status: 'completed' });
      const updateResponse = await apiService.orders.updateStatus(1, 'completed');
      expect(updateResponse.data.status).toBe('completed');
    });

    it('should handle demo mode session', async () => {
      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_token') return 'demo-abc123';
        if (key === 'demo_mode') return 'true';
        return null;
      });

      // All endpoints should work with demo token
      mock.onGet('/dashboard/stats').reply(404);
      mock.onGet('/orders').reply(404);
      mock.onGet('/customers').reply(404);

      const statsResponse = await apiService.getDashboardStats();
      const ordersResponse = await apiService.orders.getAll();
      const customersResponse = await apiService.customers.getAll();

      expect(statsResponse.data).toBeDefined();
      expect(ordersResponse.data).toBeDefined();
      expect(customersResponse.data).toBeDefined();

      // Check auth headers used demo token
      expect(mock.history.get.every(req =>
        req.headers?.Authorization === 'Demo demo-abc123'
      )).toBe(true);
    });

    it('should handle authentication flow', async () => {
      // No token initially
      (global.localStorage.getItem as jest.Mock).mockReturnValue(null);

      mock.onGet('/dashboard/stats').reply(401);

      try {
        await apiService.getDashboardStats();
      } catch (error) {
        // Expected
      }

      // Now with token
      (global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'jwt-token';
        return null;
      });

      mock.onGet('/dashboard/stats').reply(200, { revenue: 1000 });

      const response = await apiService.getDashboardStats();
      expect(response.data.revenue).toBe(1000);
    });
  });
});
