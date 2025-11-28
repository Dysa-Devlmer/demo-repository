-- Inicialización de Base de Datos ChatBotDysa
-- Script para PostgreSQL 15

-- Crear usuario de aplicación (por si no existe)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'chatbot_user') THEN
      
      CREATE ROLE chatbot_user LOGIN PASSWORD 'chatbot123';
   END IF;
END
$do$;

-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE chatbotdysa TO chatbot_user;
ALTER USER chatbot_user CREATEDB;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Crear esquemas para organizar las tablas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS restaurant;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS communications;

-- Tabla de usuarios y administradores
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de información del restaurante
CREATE TABLE IF NOT EXISTS restaurant.info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    hours JSONB,
    social_media JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de menú
CREATE TABLE IF NOT EXISTS restaurant.menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurant.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES restaurant.menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    ingredients TEXT[],
    allergens TEXT[],
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS restaurant.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    special_requests TEXT,
    table_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS restaurant.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    order_type VARCHAR(50) DEFAULT 'delivery', -- delivery, pickup, dine-in
    status VARCHAR(50) DEFAULT 'pending',
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    notes TEXT,
    estimated_time INTEGER, -- minutes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS restaurant.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) UNIQUE,
    address TEXT,
    preferences JSONB,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_order_at TIMESTAMP,
    is_vip BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de conversaciones con IA
CREATE TABLE IF NOT EXISTS ai.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    customer_phone VARCHAR(50),
    customer_name VARCHAR(255),
    platform VARCHAR(50) NOT NULL, -- whatsapp, twilio, web-widget
    status VARCHAR(50) DEFAULT 'active',
    context JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai.conversations(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de comunicaciones (WhatsApp, SMS)
CREATE TABLE IF NOT EXISTS communications.message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    customer_phone VARCHAR(50),
    message_id VARCHAR(255),
    content TEXT,
    media_urls TEXT[],
    status VARCHAR(50),
    webhook_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON restaurant.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON restaurant.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON restaurant.reservations(reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON restaurant.reservations(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON restaurant.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON restaurant.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON restaurant.customers(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON ai.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_platform_phone ON communications.message_logs(platform, customer_phone);

-- Insertar datos iniciales
INSERT INTO restaurant.info (name, description, address, phone, email) VALUES 
('DysaBot Restaurant', 'Restaurante inteligente con chatbot IA', 'Calle Principal 123', '+56912345678', 'contacto@dysabot.com')
ON CONFLICT DO NOTHING;

INSERT INTO restaurant.menu_categories (name, description, display_order) VALUES 
('Entradas', 'Deliciosas entradas para abrir el apetito', 1),
('Platos Principales', 'Nuestros platos estrella', 2),
('Postres', 'Dulces tentaciones para finalizar', 3),
('Bebidas', 'Bebidas frías y calientes', 4)
ON CONFLICT DO NOTHING;

-- Otorgar permisos sobre los esquemas al usuario
GRANT USAGE ON SCHEMA public, restaurant, ai, communications TO chatbot_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public, restaurant, ai, communications TO chatbot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public, restaurant, ai, communications TO chatbot_user;

-- Mensaje de confirmación
SELECT 'ChatBotDysa PostgreSQL Database ready for production with complete schema!' as status;