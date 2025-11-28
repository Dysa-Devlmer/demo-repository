import { useState, useEffect } from 'react';

// Datos mock para el sistema demo
export const DEMO_DATA = {
  // Dashboard Stats
  stats: {
    totalConversations: 1247,
    activeCustomers: 342,
    totalOrders: 89,
    revenue: 12450,
  },

  // Orders data
  orders: [
    {
      id: "1",
      customerName: "María González",
      customerPhone: "+56 9 8765 4321",
      orderType: "delivery" as const,
      status: "pending" as const,
      items: [
        { id: "1-1", name: "Pizza Margherita", quantity: 1, price: 12900 },
        { id: "1-2", name: "Coca Cola", quantity: 1, price: 2000 }
      ],
      subtotal: 14900,
      deliveryFee: 1000,
      total: 15900,
      deliveryAddress: "Av. Providencia 123, Santiago",
      estimatedTime: 25,
      createdAt: "2025-01-20T19:30:00Z"
    },
    {
      id: "2",
      customerName: "Carlos Ruiz",
      customerPhone: "+56 9 7654 3210",
      orderType: "pickup" as const,
      status: "preparing" as const,
      items: [
        { id: "2-1", name: "Hamburguesa Completa", quantity: 1, price: 9500 },
        { id: "2-2", name: "Papas Fritas", quantity: 1, price: 3000 }
      ],
      subtotal: 12500,
      deliveryFee: 0,
      total: 12500,
      estimatedTime: 15,
      createdAt: "2025-01-20T19:25:00Z"
    },
    {
      id: "3",
      customerName: "Ana López",
      customerPhone: "+56 9 6543 2109",
      orderType: "dine-in" as const,
      status: "ready" as const,
      items: [
        { id: "3-1", name: "Ensalada César", quantity: 1, price: 7900 },
        { id: "3-2", name: "Agua Mineral", quantity: 1, price: 1000 }
      ],
      subtotal: 8900,
      deliveryFee: 0,
      total: 8900,
      estimatedTime: 0,
      createdAt: "2025-01-20T19:20:00Z"
    },
    {
      id: "4",
      customerName: "Pedro Silva",
      customerPhone: "+56 9 5432 1098",
      orderType: "delivery" as const,
      status: "delivered" as const,
      items: [
        { id: "4-1", name: "Pasta Carbonara", quantity: 1, price: 11500 },
        { id: "4-2", name: "Vino Tinto", quantity: 1, price: 6000 }
      ],
      subtotal: 17500,
      deliveryFee: 1000,
      total: 18500,
      deliveryAddress: "Los Leones 456, Las Condes",
      estimatedTime: 0,
      createdAt: "2025-01-20T19:00:00Z"
    },
    {
      id: "5",
      customerName: "Laura Martín",
      customerPhone: "+56 9 4321 0987",
      orderType: "delivery" as const,
      status: "cancelled" as const,
      items: [
        { id: "5-1", name: "Sushi Mix", quantity: 1, price: 22900 },
        { id: "5-2", name: "Té Verde", quantity: 1, price: 1000 }
      ],
      subtotal: 23900,
      deliveryFee: 1000,
      total: 24900,
      deliveryAddress: "San Antonio 789, Vitacura",
      notes: "Sin jengibre por favor",
      estimatedTime: 0,
      createdAt: "2025-01-20T18:45:00Z"
    }
  ],

  // Customers data
  customers: [
    {
      id: 1,
      name: "María González",
      email: "maria.gonzalez@email.com",
      phone: "+56 9 8765 4321",
      whatsapp_phone: "+56 9 8765 4321",
      source: "whatsapp" as const,
      is_active: true,
      totalOrders: 15,
      totalSpent: 187500,
      lastOrder: "2025-01-20T19:30:00Z",
      last_interaction: "2025-01-20T19:30:00Z",
      created_at: "2024-06-15T10:00:00Z",
      updated_at: "2025-01-20T19:30:00Z",
      status: "active"
    },
    {
      id: 2,
      name: "Carlos Ruiz",
      email: "carlos.ruiz@email.com",
      phone: "+56 9 7654 3210",
      source: "web_widget" as const,
      is_active: true,
      totalOrders: 8,
      totalSpent: 95600,
      lastOrder: "2025-01-20T19:25:00Z",
      last_interaction: "2025-01-20T19:25:00Z",
      created_at: "2024-08-22T14:30:00Z",
      updated_at: "2025-01-20T19:25:00Z",
      status: "active"
    },
    {
      id: 3,
      name: "Ana López",
      email: "ana.lopez@email.com",
      phone: "+56 9 6543 2109",
      whatsapp_phone: "+56 9 6543 2109",
      source: "phone" as const,
      is_active: true,
      totalOrders: 22,
      totalSpent: 245300,
      lastOrder: "2025-01-20T19:20:00Z",
      last_interaction: "2025-01-20T19:20:00Z",
      created_at: "2024-03-10T09:15:00Z",
      updated_at: "2025-01-20T19:20:00Z",
      status: "vip"
    }
  ],

  // Reservations data
  reservations: [
    {
      id: 1,
      reservation_code: "RES-20250121-001",
      customer: {
        id: 101,
        name: "Roberto Campos",
        email: "roberto.campos@email.com",
        phone: "+56 9 3210 9876",
        source: "phone" as const,
        is_active: true,
        created_at: "2024-05-10T10:00:00Z",
        updated_at: "2025-01-20T15:30:00Z"
      },
      reservation_date: "2025-01-21",
      reservation_time: "20:00",
      party_size: 4,
      status: "confirmed" as const,
      preferred_section: "indoor" as const,
      table_number: "15",
      special_requests: "Mesa junto a la ventana",
      created_at: "2025-01-20T15:30:00Z",
      updated_at: "2025-01-20T15:30:00Z"
    },
    {
      id: 2,
      reservation_code: "RES-20250121-002",
      customer: {
        id: 102,
        name: "Elena Vargas",
        email: "elena.vargas@email.com",
        phone: "+56 9 2109 8765",
        source: "web_widget" as const,
        is_active: true,
        created_at: "2024-07-15T14:00:00Z",
        updated_at: "2025-01-20T14:15:00Z"
      },
      reservation_date: "2025-01-21",
      reservation_time: "19:30",
      party_size: 2,
      status: "pending" as const,
      preferred_section: "outdoor" as const,
      special_requests: "Aniversario de bodas",
      occasion: "anniversary",
      created_at: "2025-01-20T14:15:00Z",
      updated_at: "2025-01-20T14:15:00Z"
    },
    {
      id: 3,
      reservation_code: "RES-20250122-001",
      customer: {
        id: 103,
        name: "José Hernández",
        email: "jose.hernandez@email.com",
        phone: "+56 9 1098 7654",
        source: "admin" as const,
        is_active: true,
        created_at: "2024-09-20T09:00:00Z",
        updated_at: "2025-01-20T13:45:00Z"
      },
      reservation_date: "2025-01-22",
      reservation_time: "21:00",
      party_size: 6,
      status: "confirmed" as const,
      preferred_section: "private" as const,
      table_number: "VIP-1",
      special_requests: "Cena de negocios",
      occasion: "business",
      created_at: "2025-01-20T13:45:00Z",
      updated_at: "2025-01-20T13:45:00Z"
    }
  ],

  // Conversations data
  conversations: [
    {
      id: "1",
      customerName: "María González",
      customerPhone: "+56 9 8765 4321",
      channel: "whatsapp" as const,
      status: "active" as const,
      lastMessage: "¿A qué hora llega mi pedido?",
      lastActivity: "Hace 2 min",
      messageCount: 8
    },
    {
      id: "2",
      customerName: "Carlos Ruiz",
      customerPhone: "+56 9 7654 3210",
      channel: "phone" as const,
      status: "closed" as const,
      lastMessage: "Gracias, todo perfecto",
      lastActivity: "Hace 15 min",
      messageCount: 5
    },
    {
      id: "3",
      customerName: "Ana López",
      customerPhone: "+56 9 6543 2109",
      channel: "web" as const,
      status: "active" as const,
      lastMessage: "¿Tienen descuento para clientes frecuentes?",
      lastActivity: "Hace 30 min",
      messageCount: 12
    }
  ],

  // Menu items
  menu: [
    {
      id: 1,
      name: "Pizza Margherita",
      description: "Pizza clásica con tomate, mozzarella y albahaca",
      price: 12900,
      category: "Pizzas",
      available: true,
      image: "/demo/pizza-margherita.jpg"
    },
    {
      id: 2,
      name: "Hamburguesa Completa",
      description: "Carne, queso, lechuga, tomate, palta y papas fritas",
      price: 9500,
      category: "Hamburguesas",
      available: true,
      image: "/demo/hamburguesa.jpg"
    },
    {
      id: 3,
      name: "Ensalada César",
      description: "Lechuga, crutones, parmesano y aderezo césar",
      price: 7900,
      category: "Ensaladas",
      available: true,
      image: "/demo/ensalada-cesar.jpg"
    },
    {
      id: 4,
      name: "Pasta Carbonara",
      description: "Pasta con salsa carbonara, tocino y queso parmesano",
      price: 11500,
      category: "Pastas",
      available: false,
      image: "/demo/pasta-carbonara.jpg"
    }
  ]
};

// Sanitization functions to ensure numeric types
function sanitizeOrders(orders: any[]): typeof DEMO_DATA.orders {
  return orders.map(order => ({
    ...order,
    total: Number(order.total) || 0,
    subtotal: Number(order.subtotal) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    estimatedTime: Number(order.estimatedTime) || 0,
    items: order.items?.map((item: any) => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0
    })) || []
  }));
}

function sanitizeCustomers(customers: any[]): typeof DEMO_DATA.customers {
  return customers.map(customer => ({
    ...customer,
    id: Number(customer.id) || 0,
    totalOrders: Number(customer.totalOrders) || 0,
    totalSpent: Number(customer.totalSpent) || 0
  }));
}

function sanitizeReservations(reservations: any[]): typeof DEMO_DATA.reservations {
  return reservations.map(reservation => ({
    ...reservation,
    id: Number(reservation.id) || 0,
    party_size: Number(reservation.party_size) || 0,
    customer: reservation.customer ? {
      ...reservation.customer,
      id: Number(reservation.customer.id) || 0
    } : reservation.customer
  }));
}

function sanitizeMenu(menu: any[]): typeof DEMO_DATA.menu {
  return menu.map(item => ({
    ...item,
    id: Number(item.id) || 0,
    price: Number(item.price) || 0
  }));
}

// Helper to get persisted demo data from localStorage with sanitization
function getPersistedData<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;

  try {
    const stored = localStorage.getItem(`demo_${key}`);
    if (!stored) return defaultData;

    const parsed = JSON.parse(stored);

    // Sanitize based on data type
    if (key === 'orders') {
      return sanitizeOrders(parsed) as T;
    } else if (key === 'customers') {
      return sanitizeCustomers(parsed) as T;
    } else if (key === 'reservations') {
      return sanitizeReservations(parsed) as T;
    } else if (key === 'menu') {
      return sanitizeMenu(parsed) as T;
    }

    return parsed;
  } catch (error) {
    console.error(`Failed to load demo data for ${key}, using defaults:`, error);
    return defaultData;
  }
}

// Helper to persist demo data to localStorage
function persistData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`demo_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to persist demo data:', error);
  }
}

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [orders, setOrders] = useState(DEMO_DATA.orders);
  const [customers, setCustomers] = useState(DEMO_DATA.customers);
  const [reservations, setReservations] = useState(DEMO_DATA.reservations);
  const [menu, setMenu] = useState(DEMO_DATA.menu);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Función para verificar y actualizar el modo demo
    const checkDemoMode = () => {
      const demoMode = localStorage.getItem('demo_mode') === 'true';
      const hasAuthToken = !!localStorage.getItem('auth_token');

      // Si hay token real, FORZAR salida de modo demo
      if (hasAuthToken && demoMode) {
        console.log('⚠️  Detectado token real con demo_mode activo - Limpiando modo demo');
        localStorage.removeItem('demo_mode');
        localStorage.removeItem('demo_token');
        setIsDemoMode(false);
        return;
      }

      // Si cambió el modo demo, actualizar
      if (demoMode !== isDemoMode) {
        console.log(`🔄 Demo mode cambió: ${isDemoMode} → ${demoMode}`);
        setIsDemoMode(demoMode);
      }

      if (demoMode) {
        console.log('🚀 Demo mode: Cargando datos...');

        // Cargar datos desde localStorage SI EXISTEN, sino usar defaults
        const ordersData = getPersistedData('orders', DEMO_DATA.orders);
        const customersData = getPersistedData('customers', DEMO_DATA.customers);
        const reservationsData = getPersistedData('reservations', DEMO_DATA.reservations);
        const menuData = getPersistedData('menu', DEMO_DATA.menu);

        setOrders(ordersData);
        setCustomers(customersData);
        setReservations(reservationsData);
        setMenu(menuData);

        const revenue = ordersData.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        console.log('✅ Datos demo cargados');
        console.log('📊 Orders:', ordersData.length);
        console.log('💰 Revenue total:', revenue);
        console.log('💰 Revenue formateado:', new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0
        }).format(revenue).replace('$', 'CLP $'));
      } else if (!demoMode && isDemoMode) {
        // Si salimos de demo mode, limpiar los datos demo
        console.log('🚪 Saliendo de modo demo - Limpiando datos');
      }
    };

    // Verificar al montar
    checkDemoMode();

    // Escuchar cambios en localStorage (cuando otra pestaña/ventana cambia el valor)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'demo_mode' || e.key === 'auth_token') {
        console.log('📡 Storage event detectado:', e.key, '→', e.newValue);
        checkDemoMode();
      }
    };

    // Escuchar eventos de storage
    window.addEventListener('storage', handleStorageChange);

    // También verificar periódicamente (para cambios en la misma pestaña)
    const interval = setInterval(checkDemoMode, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isDemoMode]);

  // CRUD operations for demo data
  const updateOrders = (newOrders: typeof DEMO_DATA.orders) => {
    setOrders(newOrders);
    persistData('orders', newOrders);
  };

  const updateCustomers = (newCustomers: typeof DEMO_DATA.customers) => {
    setCustomers(newCustomers);
    persistData('customers', newCustomers);
  };

  const updateReservations = (newReservations: typeof DEMO_DATA.reservations) => {
    setReservations(newReservations);
    persistData('reservations', newReservations);
  };

  const updateMenu = (newMenu: typeof DEMO_DATA.menu) => {
    setMenu(newMenu);
    persistData('menu', newMenu);
  };

  // Reset demo data to defaults
  const resetDemoData = () => {
    console.log('🔄 Resetting demo data to defaults...');

    if (typeof window !== 'undefined') {
      // Limpiar TODOS los datos demo del localStorage (excepto demo_mode y demo_token)
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith('demo_') && key !== 'demo_mode' && key !== 'demo_token'
      );
      keysToRemove.forEach(key => {
        console.log(`🗑️ Removing ${key}`);
        localStorage.removeItem(key);
      });

      console.log('✅ LocalStorage limpiado');
      console.log('🔄 Recargando página para aplicar cambios...');

      // Forzar recarga de página para que se carguen los datos por defecto
      window.location.reload();
    }
  };

  return {
    isDemoMode,
    demoData: {
      ...DEMO_DATA,
      orders,
      customers,
      reservations,
      menu,
    },
    updateOrders,
    updateCustomers,
    updateReservations,
    updateMenu,
    resetDemoData
  };
}

export default useDemoMode;