import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDatabaseIndexes1728234000000 implements MigrationInterface {
    name = 'AddDatabaseIndexes1728234000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // CUSTOMERS - Optimización de búsquedas
        // ============================================

        // Índice para búsqueda por email (login, verificación)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customers_email"
            ON "customers" ("email")
            WHERE "email" IS NOT NULL;
        `);

        // Índice para búsqueda por teléfono (WhatsApp, SMS)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customers_phone"
            ON "customers" ("phone")
            WHERE "phone" IS NOT NULL;
        `);

        // Índice para búsqueda por is_active (filtros)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customers_is_active"
            ON "customers" ("is_active");
        `);

        // Índice compuesto para queries frecuentes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customers_is_active_created"
            ON "customers" ("is_active", "created_at" DESC);
        `);

        // ============================================
        // USERS - Optimización de autenticación
        // ============================================

        // Índice único para email (login)
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email"
            ON "users" ("email");
        `);

        // Índice para status (verificar usuarios activos)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_users_status"
            ON "users" ("status");
        `);

        // ============================================
        // ORDERS - Optimización de consultas
        // ============================================

        // Índice para búsqueda por email del cliente
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_orders_customer_email"
            ON "orders" ("customerEmail")
            WHERE "customerEmail" IS NOT NULL;
        `);

        // Índice para búsqueda por teléfono del cliente
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_orders_customer_phone"
            ON "orders" ("customerPhone");
        `);

        // Índice para búsqueda por status
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_orders_status"
            ON "orders" ("status");
        `);

        // Índice compuesto para dashboard (órdenes recientes por status)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_orders_status_created"
            ON "orders" ("status", "createdAt" DESC);
        `);

        // Índice para búsqueda por rango de fechas
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_orders_created_at"
            ON "orders" ("createdAt" DESC);
        `);

        // ============================================
        // RESERVATIONS - Optimización de agenda
        // ============================================

        // Índice para búsqueda por cliente
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_reservations_customer_id"
            ON "reservations" ("customerId")
            WHERE "customerId" IS NOT NULL;
        `);

        // Índice para búsqueda por fecha
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_reservations_date"
            ON "reservations" ("reservationDate");
        `);

        // Índice para búsqueda por status
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_reservations_status"
            ON "reservations" ("status");
        `);

        // Índice compuesto para calendario (reservaciones por fecha y status)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_reservations_date_status"
            ON "reservations" ("reservationDate", "status");
        `);

        // ============================================
        // MENU_ITEMS - Optimización de catálogo
        // ============================================

        // Índice para búsqueda por categoría
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_menu_items_category"
            ON "menu_items" ("category");
        `);

        // Índice para búsqueda por disponibilidad
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_menu_items_available"
            ON "menu_items" ("available");
        `);

        // Índice compuesto para menú activo (categoría + disponibilidad)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_menu_items_category_available"
            ON "menu_items" ("category", "available");
        `);

        // ============================================
        // CONVERSATIONS - Optimización de chat
        // ============================================

        // Índice para búsqueda por cliente
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_conversations_customer_id"
            ON "conversations" ("customer_id");
        `);

        // Índice para búsqueda por status
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_conversations_status"
            ON "conversations" ("status");
        `);

        // Índice compuesto para conversaciones activas
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_conversations_status_updated"
            ON "conversations" ("status", "updated_at" DESC);
        `);

        // ============================================
        // PROMOTIONS - Optimización de ofertas
        // ============================================

        // Índice para búsqueda por status
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_promotions_active"
            ON "promotions" ("active");
        `);

        // Índice para búsqueda por fechas de validez
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_promotions_dates"
            ON "promotions" ("valid_from", "valid_until");
        `);

        // Índice compuesto para promociones vigentes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_promotions_active_dates"
            ON "promotions" ("active", "valid_from", "valid_until")
            WHERE "active" = true;
        `);

        // ============================================
        // USER_ROLES - Optimización de RBAC
        // ============================================
        // NOTA: Esta tabla ya tiene índices creados automáticamente por TypeORM

        // ============================================
        // ROLE_PERMISSIONS - Optimización de permisos
        // ============================================
        // NOTA: Esta tabla ya tiene índices creados automáticamente por TypeORM

        // ============================================
        // Full-Text Search (Opcional - PostgreSQL)
        // ============================================

        // Índice de búsqueda full-text para clientes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customers_fulltext"
            ON "customers"
            USING gin(to_tsvector('spanish',
                COALESCE(name, '') || ' ' ||
                COALESCE(email, '')
            ));
        `);

        // Índice de búsqueda full-text para menú
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_menu_items_fulltext"
            ON "menu_items"
            USING gin(to_tsvector('spanish',
                COALESCE(name, '') || ' ' ||
                COALESCE(description, '')
            ));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar todos los índices en orden inverso
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_fulltext"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_fulltext"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_permission_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_role_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_role_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_user_id"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_promotions_active_dates"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_promotions_dates"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_promotions_active"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_status_updated"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_customer_id"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_category_available"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_available"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_category"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_date_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_customer_id"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status_created"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_customer_phone"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_customer_email"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_is_active_created"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_is_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_phone"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_email"`);
    }
}
