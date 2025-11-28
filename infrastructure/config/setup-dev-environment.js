#!/usr/bin/env node

/**
 * Script para configurar entorno de desarrollo y datos de prueba
 * ChatBotDysa Enterprise - Development Setup
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de base de datos
const pool = new Pool({
  host: '127.0.0.1',
  port: 15432,
  database: 'chatbotdysa',
  user: 'postgres',
  password: 'supersecret',
});

// Datos de restaurantes de prueba
const TEST_RESTAURANTS = [
  {
    name: 'Pizza Palace Deluxe',
    description: 'Auténtica pizza italiana con ingredientes frescos',
    address: 'Av. Providencia 1234, Santiago, Chile',
    phone: '+56912345678',
    email: 'contacto@pizzapalace.cl',
    website: 'https://pizzapalace.cl',
    hours: {
      lunes: '11:00-23:00',
      martes: '11:00-23:00', 
      miercoles: '11:00-23:00',
      jueves: '11:00-23:00',
      viernes: '11:00-00:00',
      sabado: '12:00-00:00',
      domingo: '12:00-22:00'
    },
    social_media: {
      instagram: '@pizzapalace_cl',
      facebook: 'PizzaPalaceChile',
      whatsapp: '+56912345678'
    }
  },
  {
    name: 'Burger Gourmet Express',
    description: 'Hamburguesas artesanales y delivery rápido',
    address: 'Las Condes 567, Santiago, Chile',
    phone: '+56987654321',
    email: 'pedidos@burgergourmet.cl',
    website: 'https://burgergourmet.cl',
    hours: {
      lunes: '12:00-22:00',
      martes: '12:00-22:00',
      miercoles: '12:00-22:00', 
      jueves: '12:00-22:00',
      viernes: '12:00-23:00',
      sabado: '12:00-23:00',
      domingo: '13:00-21:00'
    },
    social_media: {
      instagram: '@burgergourmet_express',
      facebook: 'BurgerGourmetExpress',
      twitter: '@BurgerGourmetCL'
    }
  },
  {
    name: 'Sushi Zen Tradicional',
    description: 'Sushi tradicional japonés preparado por chef certificado',
    address: 'Vitacura 890, Santiago, Chile',
    phone: '+56911223344',
    email: 'reservas@sushizen.cl',
    website: 'https://sushizen.cl',
    hours: {
      lunes: 'Cerrado',
      martes: '19:00-23:00',
      miercoles: '19:00-23:00',
      jueves: '19:00-23:00', 
      viernes: '19:00-00:00',
      sabado: '19:00-00:00',
      domingo: '19:00-22:00'
    },
    social_media: {
      instagram: '@sushizen_tradicional',
      facebook: 'SushiZenTradicional'
    }
  }
];

// Usuarios de prueba
const TEST_USERS = [
  {
    email: 'admin@pizzapalace.cl',
    password: 'admin123',
    full_name: 'Carlos Mendoza',
    role: 'admin'
  },
  {
    email: 'gerente@burgergourmet.cl', 
    password: 'gerente123',
    full_name: 'María García',
    role: 'manager'
  },
  {
    email: 'chef@sushizen.cl',
    password: 'chef123',
    full_name: 'Takeshi Yamamoto',
    role: 'kitchen'
  },
  {
    email: 'cajero@pizzapalace.cl',
    password: 'cajero123',
    full_name: 'Ana Rodríguez',
    role: 'cashier'
  },
  {
    email: 'desarrollo@chatbotdysa.com',
    password: 'dev123456',
    full_name: 'Developer Testing',
    role: 'super_admin'
  }
];

// Categorías de menú de prueba
const TEST_MENU_CATEGORIES = [
  { name: 'Entradas', description: 'Deliciosos aperitivos para comenzar', display_order: 1 },
  { name: 'Pizzas', description: 'Pizzas artesanales con masa madre', display_order: 2 },
  { name: 'Hamburguesas', description: 'Hamburguesas gourmet 100% carne', display_order: 3 },
  { name: 'Sushi Rolls', description: 'Rolls tradicionales y especiales', display_order: 4 },
  { name: 'Bebidas', description: 'Bebidas frías y calientes', display_order: 5 },
  { name: 'Postres', description: 'Dulces tentaciones caseras', display_order: 6 }
];

// Elementos de menú de prueba
const TEST_MENU_ITEMS = [
  // Entradas
  { 
    category: 'Entradas', 
    name: 'Tabla de Quesos Artesanales',
    description: 'Selección de quesos chilenos con frutos secos y mermelada casera',
    price: 12500,
    ingredients: ['Queso de cabra', 'Queso manchego', 'Nueces', 'Mermelada de higos'],
    allergens: ['Lactosa', 'Frutos secos'],
    is_featured: true
  },
  { 
    category: 'Entradas',
    name: 'Empanadas de Pino (3 unidades)',
    description: 'Tradicionales empanadas chilenas horneadas',
    price: 8900,
    ingredients: ['Carne molida', 'Cebolla', 'Huevo', 'Aceitunas', 'Pasas'],
    allergens: ['Gluten', 'Huevo']
  },
  
  // Pizzas
  {
    category: 'Pizzas',
    name: 'Pizza Margherita Tradicional',
    description: 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva',
    price: 14900,
    ingredients: ['Masa madre', 'Salsa de tomate', 'Mozzarella', 'Albahaca'],
    allergens: ['Gluten', 'Lactosa'],
    is_featured: true
  },
  {
    category: 'Pizzas', 
    name: 'Pizza Pepperoni Suprema',
    description: 'Pepperoni premium, mozzarella, champiñones y pimentón',
    price: 17900,
    ingredients: ['Masa madre', 'Salsa de tomate', 'Pepperoni', 'Mozzarella', 'Champiñones'],
    allergens: ['Gluten', 'Lactosa']
  },
  
  // Hamburguesas
  {
    category: 'Hamburguesas',
    name: 'Burger Clásica Premium',
    description: 'Carne angus 180g, lechuga, tomate, cebolla y salsa especial',
    price: 13500,
    ingredients: ['Carne angus', 'Pan brioche', 'Lechuga', 'Tomate', 'Cebolla', 'Salsa especial'],
    allergens: ['Gluten', 'Huevo'],
    is_featured: true
  },
  {
    category: 'Hamburguesas',
    name: 'Burger BBQ Bacon',
    description: 'Carne angus, bacon ahumado, cebolla caramelizada y salsa BBQ',
    price: 16900,
    ingredients: ['Carne angus', 'Bacon', 'Cebolla caramelizada', 'Salsa BBQ', 'Queso cheddar'],
    allergens: ['Gluten', 'Lactosa']
  },
  
  // Sushi
  {
    category: 'Sushi Rolls',
    name: 'Philadelphia Roll (8 piezas)',
    description: 'Salmón, queso philadelphia, palta y sésamo',
    price: 11900,
    ingredients: ['Salmón fresco', 'Queso philadelphia', 'Palta', 'Arroz', 'Nori', 'Sésamo'],
    allergens: ['Pescado', 'Lactosa', 'Sésamo']
  },
  {
    category: 'Sushi Rolls',
    name: 'California Roll (8 piezas)',
    description: 'Kanikama, palta, pepino y masago',
    price: 9900,
    ingredients: ['Kanikama', 'Palta', 'Pepino', 'Arroz', 'Nori', 'Masago'],
    allergens: ['Mariscos', 'Pescado'],
    is_featured: true
  },
  
  // Bebidas
  {
    category: 'Bebidas',
    name: 'Coca-Cola 350ml',
    description: 'Bebida gaseosa clásica',
    price: 2500,
    ingredients: ['Agua carbonatada', 'Azúcar', 'Extracto de cola'],
    allergens: []
  },
  {
    category: 'Bebidas',
    name: 'Jugo Natural de Naranja',
    description: 'Jugo de naranja recién exprimido 300ml',
    price: 3500,
    ingredients: ['Naranjas frescas'],
    allergens: []
  },
  
  // Postres
  {
    category: 'Postres',
    name: 'Tiramisu Casero',
    description: 'Tiramisu italiano tradicional con café y mascarpone',
    price: 6900,
    ingredients: ['Mascarpone', 'Café espresso', 'Bizcochos', 'Cacao', 'Huevos'],
    allergens: ['Lactosa', 'Gluten', 'Huevo'],
    is_featured: true
  },
  {
    category: 'Postres',
    name: 'Cheesecake de Berries',
    description: 'Cheesecake cremoso con salsa de berries del sur',
    price: 5900,
    ingredients: ['Queso crema', 'Galletas', 'Berries', 'Azúcar', 'Huevos'],
    allergens: ['Lactosa', 'Gluten', 'Huevo']
  }
];

// Clientes de prueba
const TEST_CUSTOMERS = [
  {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+56987654321',
    address: 'Los Leones 123, Providencia',
    preferences: { delivery: true, payment_method: 'card', spicy_level: 'medium' },
    total_orders: 15,
    total_spent: 234500,
    is_vip: true
  },
  {
    name: 'María González',
    email: 'maria.gonzalez@gmail.com', 
    phone: '+56912345678',
    address: 'Apoquindo 456, Las Condes',
    preferences: { delivery: true, payment_method: 'cash', vegetarian: true },
    total_orders: 8,
    total_spent: 128900,
    is_vip: false
  },
  {
    name: 'Pedro Silva',
    email: 'pedro.silva@outlook.com',
    phone: '+56955667788',
    address: 'Manuel Montt 789, Providencia',
    preferences: { pickup: true, payment_method: 'card', spicy_level: 'hot' },
    total_orders: 22,
    total_spent: 345600,
    is_vip: true
  }
];

// Función para insertar datos de prueba
async function setupTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando configuración de entorno de desarrollo...');
    
    // 1. Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await client.query('TRUNCATE TABLE restaurant.info CASCADE');
    await client.query('TRUNCATE TABLE public.users CASCADE');
    await client.query('TRUNCATE TABLE restaurant.menu_categories CASCADE');
    await client.query('TRUNCATE TABLE restaurant.menu_items CASCADE');
    await client.query('TRUNCATE TABLE restaurant.customers CASCADE');
    
    // 2. Insertar restaurantes de prueba
    console.log('🏪 Creando restaurantes de prueba...');
    for (const restaurant of TEST_RESTAURANTS) {
      await client.query(`
        INSERT INTO restaurant.info (name, description, address, phone, email, website, hours, social_media)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
      `, [
        restaurant.name, restaurant.description, restaurant.address,
        restaurant.phone, restaurant.email, restaurant.website,
        JSON.stringify(restaurant.hours), JSON.stringify(restaurant.social_media)
      ]);
    }
    
    // 3. Insertar usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    for (const user of TEST_USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(`
        INSERT INTO public.users (email, password, full_name, role)
        VALUES ($1, $2, $3, $4)
      `, [user.email, hashedPassword, user.full_name, user.role]);
    }
    
    // 4. Insertar categorías de menú
    console.log('📋 Creando categorías de menú...');
    const categoryIds = {};
    for (const category of TEST_MENU_CATEGORIES) {
      const result = await client.query(`
        INSERT INTO restaurant.menu_categories (name, description, display_order)
        VALUES ($1, $2, $3) RETURNING id
      `, [category.name, category.description, category.display_order]);
      categoryIds[category.name] = result.rows[0].id;
    }
    
    // 5. Insertar elementos de menú
    console.log('🍕 Creando elementos de menú...');
    for (const item of TEST_MENU_ITEMS) {
      const categoryId = categoryIds[item.category];
      await client.query(`
        INSERT INTO restaurant.menu_items (category_id, name, description, price, ingredients, allergens, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        categoryId, item.name, item.description, item.price,
        item.ingredients, item.allergens, item.is_featured || false
      ]);
    }
    
    // 6. Insertar clientes de prueba
    console.log('👤 Creando clientes de prueba...');
    for (const customer of TEST_CUSTOMERS) {
      await client.query(`
        INSERT INTO restaurant.customers (name, email, phone, address, preferences, total_orders, total_spent, is_vip)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        customer.name, customer.email, customer.phone, customer.address,
        JSON.stringify(customer.preferences), customer.total_orders,
        customer.total_spent, customer.is_vip
      ]);
    }
    
    console.log('✅ ¡Entorno de desarrollo configurado exitosamente!');
    console.log('');
    console.log('🔑 Credenciales de acceso:');
    console.log('');
    console.log('👨‍💼 Super Admin (Desarrollo):');
    console.log('   Email: desarrollo@chatbotdysa.com');
    console.log('   Password: dev123456');
    console.log('');
    console.log('🏪 Admins de Restaurante:');
    console.log('   Pizza Palace - admin@pizzapalace.cl / admin123');
    console.log('   Burger Gourmet - gerente@burgergourmet.cl / gerente123');
    console.log('   Sushi Zen - chef@sushizen.cl / chef123');
    console.log('');
    console.log('👥 Otros usuarios:');
    console.log('   Cajero - cajero@pizzapalace.cl / cajero123');
    console.log('');
    console.log('🌐 URLs de acceso:');
    console.log('   Panel Admin: http://localhost:8001');
    console.log('   API: http://localhost:8005');
    console.log('   Documentación: http://localhost:8005/api-docs');
    console.log('');
    console.log('📊 Datos creados:');
    console.log(`   • ${TEST_RESTAURANTS.length} restaurantes de prueba`);
    console.log(`   • ${TEST_USERS.length} usuarios con diferentes roles`);
    console.log(`   • ${TEST_MENU_CATEGORIES.length} categorías de menú`);
    console.log(`   • ${TEST_MENU_ITEMS.length} elementos de menú`);
    console.log(`   • ${TEST_CUSTOMERS.length} clientes con historial`);
    
  } catch (error) {
    console.error('❌ Error configurando entorno de desarrollo:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log('');
  console.log('🛠️  ChatBotDysa Enterprise - Setup de Desarrollo');
  console.log('');
  console.log('Este script configura un entorno completo de desarrollo con:');
  console.log('• Restaurantes de prueba con diferentes tipos de comida');
  console.log('• Usuarios con distintos roles (admin, gerente, chef, cajero)');
  console.log('• Menús completos con precios y descripciones');
  console.log('• Clientes con historial de pedidos');
  console.log('');
  console.log('Uso:');
  console.log('  node setup-dev-environment.js        # Configurar datos de prueba');
  console.log('  node setup-dev-environment.js --help # Mostrar esta ayuda');
  console.log('');
}

// Verificar argumentos de línea de comandos
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Ejecutar configuración
if (require.main === module) {
  setupTestData()
    .then(() => {
      console.log('🎉 ¡Listo para desarrollo y pruebas!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { setupTestData };