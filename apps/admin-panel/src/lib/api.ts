import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

// Ensure we don't double up on /api - EXPORTED for use in other files
export const getBaseUrl = () => {
  const base = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  return base.endsWith('/api') ? base : `${base}/api`;
};

// Create axios instance
export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    const demoToken = localStorage.getItem('demo_token');
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';

    if (isDemoMode && demoToken) {
      // In demo mode, use demo token with Demo prefix
      config.headers.Authorization = `Demo ${demoToken}`;
      config.headers['x-demo-token'] = demoToken;
    } else if (token) {
      // In normal mode, use JWT token with Bearer prefix
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to extract data from API responses
const extractData = (response: any) => {
  // Handle direct array
  if (Array.isArray(response)) return response;

  // Handle backend standard format: {success: true, data: {...}}
  // If nested data also has success/data, extract recursively
  if (response?.success && response?.data !== undefined) {
    const innerData = response.data;
    // Check for double-wrapped format: {success: true, data: {success: true, data: [...]}}
    if (innerData?.success && innerData?.data !== undefined) {
      return innerData.data;
    }
    return innerData;
  }

  // Handle nested data structure: {data: {data: []}}
  if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;

  // Handle simple data structure: {data: []}
  if (response?.data && Array.isArray(response.data)) return response.data;

  // Handle simple object with data field: {data: {...}}
  if (response?.data && typeof response.data === 'object') return response.data;

  return response;
};

// Demo data for fallback
const demoData = {
  conversations: [
    { id: 1, customer: "Cliente #1", message: "Hola, quiero hacer una reserva", timestamp: new Date().toISOString(), status: "active" },
    { id: 2, customer: "Cliente #2", message: "¿Tienen mesa para 4 personas?", timestamp: new Date().toISOString(), status: "pending" },
    { id: 3, customer: "Cliente #3", message: "Quisiera pedir delivery", timestamp: new Date().toISOString(), status: "completed" }
  ],
  customers: [
    { id: 1, name: "Juan Pérez", phone: "+1234567890", email: "juan@example.com", visits: 5 },
    { id: 2, name: "María García", phone: "+1234567891", email: "maria@example.com", visits: 3 },
    { id: 3, name: "Carlos López", phone: "+1234567892", email: "carlos@example.com", visits: 8 }
  ],
  orders: [
    { id: 1, customer: "María González", items: ["Pizza Margherita", "Coca Cola"], total: 15900, status: "pending", date: new Date().toISOString() },
    { id: 2, customer: "Carlos Ruiz", items: ["Hamburguesa Completa", "Papas Fritas"], total: 12500, status: "preparing", date: new Date().toISOString() },
    { id: 3, customer: "Ana López", items: ["Ensalada César", "Agua Mineral"], total: 8900, status: "ready", date: new Date().toISOString() },
    { id: 4, customer: "Pedro Silva", items: ["Pasta Carbonara", "Vino Tinto"], total: 18500, status: "delivered", date: new Date().toISOString() },
    { id: 5, customer: "Laura Martín", items: ["Sushi Mix", "Té Verde"], total: 24900, status: "cancelled", date: new Date().toISOString() }
  ],
  reservations: [
    { id: 1, customer: "Ana Martín", date: "2025-09-22", time: "20:00", guests: 4, status: "confirmed" },
    { id: 2, customer: "Luis Rodríguez", date: "2025-09-23", time: "19:30", guests: 2, status: "pending" }
  ],
  stats: {
    totalConversations: 3,
    activeCustomers: 3,
    totalOrders: 5,
    revenue: 80700
  }
};

// Smart API wrapper that falls back to demo data
const smartApiCall = async (apiCall: () => Promise<any>, demoResponse: any) => {
  // Check if in demo mode first
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true';

  if (isDemoMode) {
    // In demo mode, skip API call and return demo data directly
    console.log('🎯 Demo mode active - using demo data');
    return { data: demoResponse };
  }

  try {
    // Try official API first (only in non-demo mode)
    const response = await apiCall();
    return response;
  } catch (error: any) {
    // If endpoint doesn't exist (404), unauthorized (401), or network error, use demo data
    if (error.response?.status === 404 ||
        error.response?.status === 401 ||
        error.code === 'NETWORK_ERROR' ||
        !error.response) {
      console.log('🎯 Using demo data for offline/missing endpoint');
      return { data: demoResponse };
    }
    // For other errors (403, 500, etc.), let them through
    throw error;
  }
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Automatically extract data from paginated responses
    response.data = extractData(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // No redirigir si estamos en modo demo
      const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true';

      if (!isDemoMode) {
        // Redirect to login if unauthorized (solo en modo normal)
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Health check with fallback
  health: () => smartApiCall(() => api.get('/health'), { status: 'ok', timestamp: new Date().toISOString() }),

  // Dashboard stats with fallback
  getDashboardStats: () => smartApiCall(() => api.get('/dashboard/stats'), demoData.stats),

  // Dashboard analytics with fallbacks
  analytics: {
    getTrends: (period?: '7d' | '30d' | '90d') =>
      smartApiCall(
        () => api.get('/dashboard/analytics/trends', { params: { period: period || '7d' } }),
        [
          { date: '2025-01-14', conversaciones: 24, ordenes: 12 },
          { date: '2025-01-15', conversaciones: 32, ordenes: 18 },
          { date: '2025-01-16', conversaciones: 28, ordenes: 15 },
          { date: '2025-01-17', conversaciones: 45, ordenes: 22 },
          { date: '2025-01-18', conversaciones: 52, ordenes: 28 },
          { date: '2025-01-19', conversaciones: 38, ordenes: 20 },
          { date: '2025-01-20', conversaciones: 30, ordenes: 16 },
        ]
      ),
    getRevenue: (period?: '7d' | '30d' | '90d') =>
      smartApiCall(
        () => api.get('/dashboard/analytics/revenue', { params: { period: period || '7d' } }),
        [
          { date: '2025-01-14', ingresos: 1250000 },
          { date: '2025-01-15', ingresos: 1890000 },
          { date: '2025-01-16', ingresos: 1450000 },
          { date: '2025-01-17', ingresos: 2230000 },
          { date: '2025-01-18', ingresos: 2870000 },
          { date: '2025-01-19', ingresos: 1980000 },
          { date: '2025-01-20', ingresos: 1670000 },
        ]
      ),
    getOrdersByStatus: () =>
      smartApiCall(
        () => api.get('/dashboard/analytics/orders-by-status'),
        [
          { name: 'Pendientes', value: 8 },
          { name: 'En preparación', value: 15 },
          { name: 'Listos', value: 5 },
          { name: 'Entregados', value: 42 },
          { name: 'Cancelados', value: 3 },
        ]
      ),
    getCustomersBySource: () =>
      smartApiCall(
        () => api.get('/dashboard/analytics/customers-by-source'),
        [
          { name: 'WhatsApp', value: 145 },
          { name: 'Web Widget', value: 89 },
          { name: 'Teléfono', value: 67 },
          { name: 'Admin Panel', value: 41 },
        ]
      ),
  },

  // Menu management
  menu: {
    getAll: () => smartApiCall(() => api.get('/menu'), [
      { id: 1, name: "Pizza Margherita", price: 12900, category: "Pizzas", available: true },
      { id: 2, name: "Hamburguesa Completa", price: 9500, category: "Hamburguesas", available: true },
      { id: 3, name: "Ensalada César", price: 7900, category: "Ensaladas", available: true },
      { id: 4, name: "Pasta Carbonara", price: 11500, category: "Pastas", available: false }
    ]),
    getById: (id: string) => api.get(`/menu/${id}`),
    create: (data: any) => api.post('/menu', data),
    update: (id: string, data: any) => api.put(`/menu/${id}`, data),
    delete: (id: string) => api.delete(`/menu/${id}`),
    toggleAvailability: (id: number | string) => api.patch(`/menu/${id}/toggle-availability`),
  },

  // Orders management with smart fallback
  orders: {
    getAll: (params?: any) => smartApiCall(() => api.get('/orders', { params }), demoData.orders),
    getById: (id: number) => api.get(`/orders/${id}`),
    updateStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }),
    create: (data: any) => api.post('/orders', data),
  },

  // Reservations management with smart fallback
  reservations: {
    getAll: (params?: any) => smartApiCall(() => api.get('/reservations', { params }), demoData.reservations),
    getById: (id: number) => api.get(`/reservations/${id}`),
    create: (data: any) => api.post('/reservations', data),
    update: (id: number, data: any) => api.put(`/reservations/${id}`, data),
    updateStatus: (id: number, status: string) => api.patch(`/reservations/${id}/status`, { status }),
    delete: (id: number) => api.delete(`/reservations/${id}`),
  },

  // Customers management with smart fallback
  customers: {
    getAll: (params?: any) => smartApiCall(() => api.get('/customers', { params }), demoData.customers),
    getById: (id: number) => api.get(`/customers/${id}`),
    create: (data: any) => api.post('/customers', data),
    update: (id: number, data: any) => api.put(`/customers/${id}`, data),
    delete: (id: number) => api.delete(`/customers/${id}`),
  },

  // Conversations management with smart fallback
  conversations: {
    getAll: (params?: any) => smartApiCall(() => api.get('/conversations', { params }), demoData.conversations),
    getById: (id: number) => api.get(`/conversations/${id}`),
    getMessages: (id: number) => api.get(`/conversations/${id}/messages`),
    sendMessage: (id: number, message: string) => api.post(`/conversations/${id}/messages`, { message }),
    create: (data: any) => api.post('/conversations', data),
    update: (id: number, data: any) => api.put(`/conversations/${id}`, data),
    delete: (id: number) => api.delete(`/conversations/${id}`),
  },
  
  // Settings management
  settings: {
    get: () => smartApiCall(() => api.get('/settings'), [
      { key: 'restaurant_name', value: 'ChatBotDysa Demo' },
      { key: 'restaurant_phone', value: '+56912345678' },
      { key: 'restaurant_address', value: 'Av. Las Condes 1234, Santiago, Chile' },
      { key: 'restaurant_email', value: 'contacto@chatbotdysa.cl' },
      { key: 'whatsapp_phone_number', value: '+56912345678' },
      { key: 'whatsapp_token', value: '••••••••••••••' },
      { key: 'twilio_account_sid', value: 'ACxxxxxxxxxxxx' },
      { key: 'twilio_auth_token', value: '••••••••••••••' },
      { key: 'ollama_url', value: 'http://localhost:11434' },
      { key: 'ollama_model', value: 'mistral' }
    ]),
    update: (data: any) => api.put('/settings', data),
    getRestaurantInfo: () => api.get('/settings/restaurant'),
    updateRestaurantInfo: (data: any) => api.put('/settings/restaurant', data),
    getWhatsAppConfig: () => api.get('/settings/whatsapp'),
    updateWhatsAppConfig: (data: any) => api.put('/settings/whatsapp', data),
    getTwilioConfig: () => api.get('/settings/twilio'),
    updateTwilioConfig: (data: any) => api.put('/settings/twilio', data),
    testWhatsApp: (data: any) => smartApiCall(() => api.post('/settings/test/whatsapp', data), {
      success: true,
      message: 'Prueba de WhatsApp completada exitosamente (Demo)',
      timestamp: new Date().toISOString(),
      testResults: {
        connection: 'success',
        authentication: 'valid',
        phoneNumber: data?.phoneNumber || '+1234567890',
        apiVersion: 'v18.0',
        webhookStatus: 'configured'
      }
    }),
  },
  
  // AI management
  ai: {
    chat: (message: string, context?: any) => api.post('/ai/chat', { message, context }),
    getModels: () => api.get('/ai/models'),
    setModel: (model: string) => api.post('/ai/model', { model }),
  },

  // Pithy Learning System
  pithy: {
    getStats: () => smartApiCall(() => api.get('/ai/jarvis/stats'), {
      totalExperiences: 0,
      averageSentiment: 0,
      averageComplexity: 5,
      averageReward: 0,
      uniqueIntents: [],
      qTableSize: 0,
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      complexityDistribution: {},
      intentDistribution: {},
      hourlyDistribution: {},
      successRate: 0
    }),
    getInsights: () => smartApiCall(() => api.get('/ai/jarvis/insights'), {
      topPatterns: [],
      sentimentTrend: [],
      peakHours: [],
      commonIntents: [],
      communicationStyles: { formal: 0, informal: 0, neutral: 0 }
    }),
    analyzeMessage: (message: string) => api.post('/ai/jarvis/analyze', { message }),
    recordFeedback: (experienceId: number, isPositive: boolean, feedbackText?: string) =>
      api.post('/ai/jarvis/feedback', { experienceId, isPositive, feedbackText }),
    exportQTable: () => api.get('/ai/jarvis/q-table'),
    importQTable: (qTable: any) => api.post('/ai/jarvis/q-table', qTable),
  },

  // Users management with fallback
  users: {
    getAll: (params?: any) => smartApiCall(() => api.get('/users', { params }), [
      { id: 1, email: 'admin@zgamersa.com', name: 'Administrador', roles: ['admin'], status: 'active' },
      { id: 2, email: 'gerente@zgamersa.com', name: 'Gerente', roles: ['manager'], status: 'active' },
      { id: 3, email: 'mesero@zgamersa.com', name: 'Mesero', roles: ['waiter'], status: 'active' },
    ]),
    getById: (id: number) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users', data),
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
    updateRoles: (id: number, roleIds: number[] | string[]) => api.put(`/users/${id}/roles`, { roleIds }),
    updatePermissions: (id: number, permissions: string[]) => api.put(`/users/${id}/permissions`, { permissions }),
    getActivity: (id: number, params?: any) => api.get(`/users/${id}/activity`, { params }),
  },

  // Roles management with fallback
  roles: {
    getAll: (params?: any) => smartApiCall(() => api.get('/roles', { params }), [
      {
        id: 1,
        name: 'admin',
        displayName: 'Administrador',
        description: 'Acceso completo al sistema',
        isActive: true,
        isSystem: true,
        permissions: [
          { id: 1, name: 'dashboard.read', displayName: 'Ver Dashboard', description: 'Ver dashboard principal', module: 'dashboard', action: 'read', isActive: true },
          { id: 2, name: 'dashboard.manage', displayName: 'Gestionar Dashboard', description: 'Administrar dashboard', module: 'dashboard', action: 'manage', isActive: true },
          { id: 3, name: 'customers.create', displayName: 'Crear Clientes', description: 'Crear nuevos clientes', module: 'customers', action: 'create', isActive: true },
          { id: 4, name: 'customers.read', displayName: 'Ver Clientes', description: 'Ver lista de clientes', module: 'customers', action: 'read', isActive: true },
          { id: 5, name: 'customers.update', displayName: 'Actualizar Clientes', description: 'Modificar información de clientes', module: 'customers', action: 'update', isActive: true },
          { id: 6, name: 'customers.delete', displayName: 'Eliminar Clientes', description: 'Eliminar clientes del sistema', module: 'customers', action: 'delete', isActive: true },
          { id: 7, name: 'orders.create', displayName: 'Crear Órdenes', description: 'Crear nuevas órdenes', module: 'orders', action: 'create', isActive: true },
          { id: 8, name: 'orders.read', displayName: 'Ver Órdenes', description: 'Ver lista de órdenes', module: 'orders', action: 'read', isActive: true },
          { id: 9, name: 'orders.update', displayName: 'Actualizar Órdenes', description: 'Modificar órdenes existentes', module: 'orders', action: 'update', isActive: true },
          { id: 10, name: 'orders.delete', displayName: 'Eliminar Órdenes', description: 'Eliminar órdenes', module: 'orders', action: 'delete', isActive: true },
          { id: 11, name: 'menu.create', displayName: 'Crear Menú', description: 'Crear items de menú', module: 'menu', action: 'create', isActive: true },
          { id: 12, name: 'menu.read', displayName: 'Ver Menú', description: 'Ver items del menú', module: 'menu', action: 'read', isActive: true },
          { id: 13, name: 'menu.update', displayName: 'Actualizar Menú', description: 'Modificar items del menú', module: 'menu', action: 'update', isActive: true },
          { id: 14, name: 'menu.delete', displayName: 'Eliminar Menú', description: 'Eliminar items del menú', module: 'menu', action: 'delete', isActive: true },
          { id: 15, name: 'users.create', displayName: 'Crear Usuarios', description: 'Crear nuevos usuarios', module: 'users', action: 'create', isActive: true },
          { id: 16, name: 'users.read', displayName: 'Ver Usuarios', description: 'Ver lista de usuarios', module: 'users', action: 'read', isActive: true },
          { id: 17, name: 'users.update', displayName: 'Actualizar Usuarios', description: 'Modificar información de usuarios', module: 'users', action: 'update', isActive: true },
          { id: 18, name: 'users.delete', displayName: 'Eliminar Usuarios', description: 'Eliminar usuarios del sistema', module: 'users', action: 'delete', isActive: true },
          { id: 19, name: 'system.manage', displayName: 'Administrar Sistema', description: 'Administración completa del sistema', module: 'system', action: 'manage', isActive: true },
        ],
      },
      {
        id: 2,
        name: 'manager',
        displayName: 'Gerente',
        description: 'Gestión de operaciones del restaurante',
        isActive: true,
        isSystem: true,
        permissions: [
          { id: 4, name: 'customers.read', displayName: 'Ver Clientes', description: 'Ver lista de clientes', module: 'customers', action: 'read', isActive: true },
          { id: 8, name: 'orders.read', displayName: 'Ver Órdenes', description: 'Ver lista de órdenes', module: 'orders', action: 'read', isActive: true },
          { id: 9, name: 'orders.update', displayName: 'Actualizar Órdenes', description: 'Modificar órdenes existentes', module: 'orders', action: 'update', isActive: true },
          { id: 12, name: 'menu.read', displayName: 'Ver Menú', description: 'Ver items del menú', module: 'menu', action: 'read', isActive: true },
          { id: 13, name: 'menu.update', displayName: 'Actualizar Menú', description: 'Modificar items del menú', module: 'menu', action: 'update', isActive: true },
        ],
      },
      {
        id: 3,
        name: 'staff',
        displayName: 'Personal',
        description: 'Personal del restaurante',
        isActive: true,
        isSystem: true,
        permissions: [
          { id: 4, name: 'customers.read', displayName: 'Ver Clientes', description: 'Ver lista de clientes', module: 'customers', action: 'read', isActive: true },
          { id: 8, name: 'orders.read', displayName: 'Ver Órdenes', description: 'Ver lista de órdenes', module: 'orders', action: 'read', isActive: true },
          { id: 12, name: 'menu.read', displayName: 'Ver Menú', description: 'Ver items del menú', module: 'menu', action: 'read', isActive: true },
        ],
      },
      {
        id: 4,
        name: 'user',
        displayName: 'Usuario',
        description: 'Usuario básico del sistema',
        isActive: true,
        isSystem: false,
        permissions: [
          { id: 4, name: 'customers.read', displayName: 'Ver Clientes', description: 'Ver lista de clientes', module: 'customers', action: 'read', isActive: true },
        ],
      },
    ]),
    getById: (id: number) => api.get(`/roles/${id}`),
    create: (data: any) => api.post('/roles', data),
    update: (id: number, data: any) => api.put(`/roles/${id}`, data),
    delete: (id: number) => api.delete(`/roles/${id}`),
  },

  // Reports management with fallback
  reports: {
    // Get all report configurations with optional filters
    getAll: (params?: { type?: string; status?: string }) =>
      smartApiCall(() => api.get('/reports', { params }), [
        { id: 1, name: 'Reporte Diario de Ventas', type: 'sales', status: 'active', schedule: 'daily' },
        { id: 2, name: 'Reporte Semanal de Clientes', type: 'customers', status: 'active', schedule: 'weekly' },
        { id: 3, name: 'Reporte Mensual de Inventario', type: 'inventory', status: 'active', schedule: 'monthly' },
      ]),

    // Get report configuration by ID
    getById: (id: number) =>
      api.get(`/reports/${id}`),

    // Create new report configuration
    create: (data: any) =>
      api.post('/reports', data),

    // Update report configuration
    update: (id: number, data: any) =>
      api.put(`/reports/${id}`, data),

    // Delete report configuration (hard delete)
    delete: (id: number) =>
      api.delete(`/reports/${id}`),

    // Archive report configuration (soft delete)
    archive: (id: number) =>
      api.put(`/reports/${id}/archive`),

    // Generate report file
    generate: (id: number) =>
      api.post(`/reports/${id}/generate`),

    // Get reports statistics
    getStatistics: () =>
      smartApiCall(() => api.get('/reports/statistics'), {
        total: 3,
        active: 3,
        scheduled: 3
      }),

    // Get scheduled reports
    getScheduled: () =>
      smartApiCall(() => api.get('/reports/scheduled'), []),

    // Get reports by type
    getByType: (type: string) =>
      smartApiCall(() => api.get(`/reports/type/${type}`), []),
  },

  // Categories management
  categories: {
    // Get all categories with optional inactive filter
    getAll: (params?: { includeInactive?: boolean }) =>
      smartApiCall(
        () => api.get('/categories', { params }),
        [
          {
            id: 1,
            name: "Entradas",
            slug: "entradas",
            description: "Aperitivos y entradas",
            icon: "🍽️",
            preparation_area: "kitchen",
            display_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Platos Principales",
            slug: "platos-principales",
            description: "Platos fuertes y principales",
            icon: "🍖",
            preparation_area: "kitchen",
            display_order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 3,
            name: "Postres",
            slug: "postres",
            description: "Postres y dulces",
            icon: "🍰",
            preparation_area: "kitchen",
            display_order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 4,
            name: "Bebidas",
            slug: "bebidas",
            description: "Bebidas frías y calientes",
            icon: "🥤",
            preparation_area: "bar",
            display_order: 4,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 5,
            name: "Snacks",
            slug: "snacks",
            description: "Bocadillos y snacks",
            icon: "🍿",
            preparation_area: "both",
            display_order: 5,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
      ),

    // Get category by ID
    getById: (id: number) =>
      api.get(`/categories/${id}`),

    // Get category by slug
    getBySlug: (slug: string) =>
      api.get(`/categories/slug/${slug}`),

    // Create new category
    create: (data: any) =>
      api.post('/categories', data),

    // Update existing category (PUT para consistencia con otras APIs)
    update: (id: number, data: any) =>
      api.put(`/categories/${id}`, data),

    // Delete category (soft delete if has items, hard delete if empty)
    delete: (id: number) =>
      api.delete(`/categories/${id}`),

    // Toggle category active status
    toggleActive: (id: number) =>
      api.post(`/categories/${id}/toggle`),

    // Update display order for multiple categories
    reorder: (orderUpdates: Array<{ id: number; display_order: number }>) =>
      api.patch('/categories/reorder', orderUpdates),
  },
};

export default apiService;