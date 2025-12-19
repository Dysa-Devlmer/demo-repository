import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageDeliveryStatus1733450100000 implements MigrationInterface {
  name = 'AddMessageDeliveryStatus1733450100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for message delivery status
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."messages_delivery_status_enum" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    // Add delivery_status column with default 'pending'
    await queryRunner.query(`
            ALTER TABLE "messages"
            ADD COLUMN IF NOT EXISTS "delivery_status" "public"."messages_delivery_status_enum" NOT NULL DEFAULT 'pending'
        `);

    // Add delivered_at timestamp column
    await queryRunner.query(`
            ALTER TABLE "messages"
            ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP
        `);

    // Add read_at timestamp column
    await queryRunner.query(`
            ALTER TABLE "messages"
            ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP
        `);

    // Create index for delivery_status for faster filtering
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_messages_delivery_status" ON "messages" ("delivery_status")
        `);

    // Update existing messages: set outgoing messages (bot/agent) to 'sent' if they don't have errors
    await queryRunner.query(`
            UPDATE "messages"
            SET "delivery_status" = 'sent'
            WHERE "role" IN ('bot', 'agent')
            AND "error_message" IS NULL
            AND "delivery_status" = 'pending'
        `);

    // Set incoming messages (user) to 'delivered' (they were received)
    await queryRunner.query(`
            UPDATE "messages"
            SET "delivery_status" = 'delivered'
            WHERE "role" = 'user'
            AND "delivery_status" = 'pending'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_delivery_status"`);

    // Remove columns
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "read_at"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "delivered_at"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "delivery_status"`);

    // Remove enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."messages_delivery_status_enum"`);
  }
}
