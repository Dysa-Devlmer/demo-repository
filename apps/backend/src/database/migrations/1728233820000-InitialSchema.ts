import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1728233820000 implements MigrationInterface {
    name = 'InitialSchema1728233820000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Esta migración representa el estado inicial de la base de datos
        // Como ya tenemos datos, solo creamos la tabla de migraciones
        // Las tablas existentes se mantienen tal cual

        await queryRunner.query(`
            -- Verificar que las tablas existen
            DO $$
            BEGIN
                -- Si las tablas no existen, crear el schema completo
                IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN

                    -- Table: users
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        password VARCHAR(255) NOT NULL,
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        phone VARCHAR(20),
                        status VARCHAR(20) DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login TIMESTAMP
                    );

                    -- Table: roles
                    CREATE TABLE IF NOT EXISTS roles (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(50) NOT NULL UNIQUE,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    -- Table: permissions
                    CREATE TABLE IF NOT EXISTS permissions (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        description TEXT,
                        module VARCHAR(50),
                        action VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    -- Table: user_roles (many-to-many)
                    CREATE TABLE IF NOT EXISTS user_roles (
                        user_id INTEGER NOT NULL,
                        role_id INTEGER NOT NULL,
                        PRIMARY KEY (user_id, role_id),
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
                    );

                    -- Table: role_permissions (many-to-many)
                    CREATE TABLE IF NOT EXISTS role_permissions (
                        role_id INTEGER NOT NULL,
                        permission_id INTEGER NOT NULL,
                        PRIMARY KEY (role_id, permission_id),
                        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
                    );

                    -- Table: customers
                    CREATE TABLE IF NOT EXISTS customers (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255),
                        phone VARCHAR(20),
                        address TEXT,
                        city VARCHAR(100),
                        country VARCHAR(100) DEFAULT 'Chile',
                        preferences JSONB,
                        notes TEXT,
                        status VARCHAR(20) DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    -- Table: menu_items
                    CREATE TABLE IF NOT EXISTS menu_items (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        price INTEGER NOT NULL,
                        category VARCHAR(50) NOT NULL,
                        image_url VARCHAR(500),
                        available BOOLEAN DEFAULT true,
                        allergens TEXT[],
                        preparation_time INTEGER,
                        calories INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    -- Table: orders
                    CREATE TABLE IF NOT EXISTS orders (
                        id SERIAL PRIMARY KEY,
                        order_number VARCHAR(50) NOT NULL UNIQUE,
                        customer_id INTEGER,
                        type VARCHAR(20) NOT NULL,
                        status VARCHAR(20) DEFAULT 'pending',
                        items JSONB NOT NULL,
                        subtotal INTEGER NOT NULL,
                        tax INTEGER DEFAULT 0,
                        delivery_fee INTEGER DEFAULT 0,
                        total INTEGER NOT NULL,
                        delivery_address TEXT,
                        delivery_instructions TEXT,
                        payment_method VARCHAR(50),
                        payment_status VARCHAR(20) DEFAULT 'pending',
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        completed_at TIMESTAMP,
                        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
                    );

                    -- Table: reservations
                    CREATE TABLE IF NOT EXISTS reservations (
                        id SERIAL PRIMARY KEY,
                        reservation_code VARCHAR(50) NOT NULL UNIQUE,
                        customer_id INTEGER,
                        customer_name VARCHAR(255) NOT NULL,
                        customer_phone VARCHAR(20) NOT NULL,
                        customer_email VARCHAR(255),
                        reservation_date TIMESTAMP NOT NULL,
                        party_size INTEGER NOT NULL,
                        table_number VARCHAR(20),
                        status VARCHAR(20) DEFAULT 'pending',
                        special_requests TEXT,
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        confirmed_at TIMESTAMP,
                        cancelled_at TIMESTAMP,
                        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
                    );

                    -- Table: promotions
                    CREATE TABLE IF NOT EXISTS promotions (
                        id SERIAL PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        discount_type VARCHAR(20) NOT NULL,
                        discount_value INTEGER NOT NULL,
                        code VARCHAR(50) UNIQUE,
                        min_order_amount INTEGER,
                        max_uses INTEGER,
                        current_uses INTEGER DEFAULT 0,
                        valid_from TIMESTAMP NOT NULL,
                        valid_until TIMESTAMP NOT NULL,
                        active BOOLEAN DEFAULT true,
                        applicable_to JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    -- Table: conversations
                    CREATE TABLE IF NOT EXISTS conversations (
                        id SERIAL PRIMARY KEY,
                        session_id VARCHAR(100) NOT NULL UNIQUE,
                        customer_id INTEGER,
                        customer_name VARCHAR(255),
                        customer_phone VARCHAR(20),
                        platform VARCHAR(50) DEFAULT 'web',
                        status VARCHAR(20) DEFAULT 'active',
                        messages JSONB,
                        metadata JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        closed_at TIMESTAMP,
                        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
                    );

                    -- Indexes para performance
                    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
                    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
                    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
                    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
                    CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
                    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
                    CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
                    CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
                    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
                    CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
                    CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);

                END IF;
            END $$;
        `);

        console.log('✅ InitialSchema migration completed - Database schema verified');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No hacemos DROP de las tablas en el down porque queremos preservar los datos
        // Esta es la migración inicial, no debería revertirse
        console.log('⚠️  InitialSchema migration rollback skipped - preserving existing data');
    }
}
