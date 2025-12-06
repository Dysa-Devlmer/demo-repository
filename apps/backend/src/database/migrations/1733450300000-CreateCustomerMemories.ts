import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerMemories1733450300000 implements MigrationInterface {
  name = "CreateCustomerMemories1733450300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for memory_type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."customer_memories_memory_type_enum" AS ENUM(
          'preference', 'address', 'personal', 'order_history', 'communication', 'feedback', 'custom'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum type for source
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."customer_memories_source_enum" AS ENUM('explicit', 'inferred', 'action');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create customer_memories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer_memories" (
        "id" SERIAL NOT NULL,
        "customer_id" integer NOT NULL,
        "memory_type" "public"."customer_memories_memory_type_enum" NOT NULL DEFAULT 'custom',
        "key" character varying(100) NOT NULL,
        "value" text NOT NULL,
        "confidence" float NOT NULL DEFAULT 0.5,
        "usage_count" integer NOT NULL DEFAULT 1,
        "source" "public"."customer_memories_source_enum" NOT NULL DEFAULT 'inferred',
        "context" text,
        "conversation_id" integer,
        "expires_at" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_accessed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_memories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customer_memories_customer" FOREIGN KEY ("customer_id")
          REFERENCES "customers"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_customer_memories_customer_type"
      ON "customer_memories" ("customer_id", "memory_type")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_customer_memories_customer_key"
      ON "customer_memories" ("customer_id", "key")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_customer_memories_customer_id"
      ON "customer_memories" ("customer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_customer_memories_active"
      ON "customer_memories" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_customer_memories_last_accessed"
      ON "customer_memories" ("last_accessed_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_last_accessed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_customer_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_customer_key"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_customer_type"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_memories"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."customer_memories_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."customer_memories_memory_type_enum"`);
  }
}
