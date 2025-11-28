import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettingsTables1728235000000 implements MigrationInterface {
    name = 'CreateSettingsTables1728235000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create settings enum type
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "setting_status_enum" AS ENUM ('active', 'draft', 'archived');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "setting_category_enum" AS ENUM (
                    'restaurant', 'whatsapp', 'twilio', 'ollama',
                    'database', 'general', 'security', 'notifications'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "setting_change_action_enum" AS ENUM (
                    'created', 'updated', 'deleted', 'activated', 'archived'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create settings table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "settings" (
                "id" SERIAL PRIMARY KEY,
                "key" VARCHAR NOT NULL UNIQUE,
                "value" TEXT NOT NULL,
                "category" setting_category_enum NOT NULL DEFAULT 'general',
                "description" VARCHAR,
                "status" setting_status_enum NOT NULL DEFAULT 'active',
                "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
                "is_required" BOOLEAN NOT NULL DEFAULT false,
                "validation_rules" JSONB,
                "metadata" JSONB,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

        // Create setting_history table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "setting_history" (
                "id" SERIAL PRIMARY KEY,
                "setting_id" INTEGER NOT NULL,
                "action" setting_change_action_enum NOT NULL,
                "old_value" TEXT,
                "new_value" TEXT,
                "changed_by" VARCHAR,
                "reason" VARCHAR,
                "metadata" JSONB,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_setting_history_setting"
                    FOREIGN KEY ("setting_id")
                    REFERENCES "settings"("id")
                    ON DELETE CASCADE
            );
        `);

        // Create indexes for settings
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_settings_key"
            ON "settings" ("key");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_settings_category_key"
            ON "settings" ("category", "key");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_settings_status"
            ON "settings" ("status");
        `);

        // Create indexes for setting_history
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_setting_history_setting_id"
            ON "setting_history" ("setting_id", "created_at");
        `);

        // Insert default settings
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "category", "description", "is_required")
            VALUES
                ('app.name', 'ChatBotDysa Enterprise', 'general', 'Nombre de la aplicación', true),
                ('app.version', '2.0.0', 'general', 'Versión de la aplicación', true),
                ('app.env', 'production', 'general', 'Entorno de ejecución', true),
                ('restaurant.name', 'ZG Amers Restaurant', 'restaurant', 'Nombre del restaurante', true),
                ('restaurant.timezone', 'America/Los_Angeles', 'restaurant', 'Zona horaria', true),
                ('restaurant.currency', 'USD', 'restaurant', 'Moneda', true),
                ('whatsapp.enabled', 'false', 'whatsapp', 'WhatsApp habilitado', false),
                ('twilio.enabled', 'false', 'twilio', 'Twilio habilitado', false),
                ('ollama.enabled', 'true', 'ollama', 'Ollama AI habilitado', false),
                ('ollama.model', 'llama3.2', 'ollama', 'Modelo de Ollama', false)
            ON CONFLICT ("key") DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "setting_history"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE IF EXISTS "setting_change_action_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "setting_category_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "setting_status_enum"`);
    }
}
