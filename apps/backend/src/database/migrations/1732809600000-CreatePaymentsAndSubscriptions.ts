import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsAndSubscriptions1732809600000 implements MigrationInterface {
  name = 'CreatePaymentsAndSubscriptions1732809600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para payment_status
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payment_status_enum" AS ENUM (
          'pending', 'approved', 'rejected', 'refunded',
          'cancelled', 'in_process', 'in_mediation', 'charged_back'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear enum para payment_provider
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payment_provider_enum" AS ENUM ('mercadopago', 'transfer', 'invoice');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear enum para billing_period
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "billing_period_enum" AS ENUM ('monthly', 'annual', 'one_time');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear enum para subscription_status
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "subscription_status_enum" AS ENUM (
          'trial', 'active', 'cancelled', 'expired', 'suspended', 'pending_payment'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear enum para plan_type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "plan_type_enum" AS ENUM ('saas-multi', 'saas-dedicated', 'on-premise');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear tabla payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER,
        "external_payment_id" VARCHAR,
        "external_reference" VARCHAR,
        "preference_id" VARCHAR,
        "provider" "payment_provider_enum" DEFAULT 'mercadopago',
        "status" "payment_status_enum" DEFAULT 'pending',
        "status_detail" VARCHAR,
        "amount" DECIMAL(12,2) NOT NULL,
        "currency" VARCHAR DEFAULT 'CLP',
        "plan_id" VARCHAR NOT NULL,
        "plan_name" VARCHAR NOT NULL,
        "billing_period" "billing_period_enum" DEFAULT 'monthly',
        "payer_email" VARCHAR NOT NULL,
        "payer_name" VARCHAR,
        "payer_identification" VARCHAR,
        "company_name" VARCHAR,
        "metadata" JSONB,
        "webhook_data" JSONB,
        "date_approved" TIMESTAMP,
        "date_refunded" TIMESTAMP,
        "refund_amount" DECIMAL(12,2),
        "refund_reason" VARCHAR,
        "invoice_number" VARCHAR,
        "receipt_url" VARCHAR,
        "email_sent" BOOLEAN DEFAULT false,
        "notification_sent" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT LOCALTIMESTAMP,
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT LOCALTIMESTAMP,
        CONSTRAINT "fk_payments_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    // Crear índices para payments
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_payments_external_id"
      ON "payments" ("external_payment_id")
      WHERE "external_payment_id" IS NOT NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_user_status"
      ON "payments" ("user_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_created_at"
      ON "payments" ("created_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_payer_email"
      ON "payments" ("payer_email");
    `);

    // Crear tabla subscriptions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL UNIQUE,
        "plan_type" "plan_type_enum" DEFAULT 'saas-multi',
        "plan_name" VARCHAR NOT NULL,
        "status" "subscription_status_enum" DEFAULT 'trial',
        "monthly_price" DECIMAL(12,2) NOT NULL,
        "currency" VARCHAR DEFAULT 'CLP',
        "billing_cycle" VARCHAR DEFAULT 'monthly',
        "starts_at" TIMESTAMP NOT NULL,
        "ends_at" TIMESTAMP,
        "trial_ends_at" TIMESTAMP,
        "cancelled_at" TIMESTAMP,
        "cancel_reason" VARCHAR,
        "last_payment_at" TIMESTAMP,
        "next_payment_at" TIMESTAMP,
        "payment_failures" INTEGER DEFAULT 0,
        "features" JSONB,
        "limits" JSONB,
        "metadata" JSONB,
        "auto_renew" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT LOCALTIMESTAMP,
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT LOCALTIMESTAMP,
        CONSTRAINT "fk_subscriptions_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Crear índices para subscriptions
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_status"
      ON "subscriptions" ("status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_ends_at"
      ON "subscriptions" ("ends_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_next_payment"
      ON "subscriptions" ("next_payment_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_subscriptions_next_payment";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_subscriptions_ends_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_subscriptions_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_payer_email";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_created_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_user_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_external_id";`);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments";`);

    // Eliminar enums
    await queryRunner.query(`DROP TYPE IF EXISTS "plan_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "subscription_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "billing_period_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_provider_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum";`);
  }
}
