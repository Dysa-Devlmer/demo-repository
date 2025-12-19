import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerMemories1733450300000 implements MigrationInterface {
  name = 'CreateCustomerMemories1733450300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para tipos de memoria
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."customer_memory_type_enum" AS ENUM('preference', 'address', 'communication', 'order', 'personal');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    // Crear enum para niveles de confianza
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."customer_memory_confidence_enum" AS ENUM('low', 'medium', 'high', 'confirmed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    // Crear tabla customer_memories
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "customer_memories" (
                "id" SERIAL PRIMARY KEY,
                "customer_id" INTEGER NOT NULL,
                "memory_type" "public"."customer_memory_type_enum" NOT NULL,
                "memory_key" VARCHAR(100) NOT NULL,
                "memory_value" TEXT NOT NULL,
                "confidence" "public"."customer_memory_confidence_enum" NOT NULL DEFAULT 'low',
                "usage_count" INTEGER NOT NULL DEFAULT 1,
                "last_used_at" TIMESTAMP,
                "metadata" JSONB,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "q_value" FLOAT NOT NULL DEFAULT 0.5,
                "reward_sum" FLOAT NOT NULL DEFAULT 0,
                "reward_count" INTEGER NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_customer_memories_customer"
                    FOREIGN KEY ("customer_id")
                    REFERENCES "customers"("id")
                    ON DELETE CASCADE
            )
        `);

    // Crear índices para búsqueda eficiente
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customer_memories_customer_type"
            ON "customer_memories" ("customer_id", "memory_type")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customer_memories_customer_key"
            ON "customer_memories" ("customer_id", "memory_key")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customer_memories_active"
            ON "customer_memories" ("is_active")
            WHERE "is_active" = true
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_customer_memories_q_value"
            ON "customer_memories" ("q_value" DESC)
            WHERE "is_active" = true
        `);

    // Crear índice único para evitar duplicados
    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_memories_unique"
            ON "customer_memories" ("customer_id", "memory_type", "memory_key")
            WHERE "is_active" = true
        `);

    // Trigger para actualizar updated_at
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_customer_memories_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

    await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_customer_memories_updated_at ON customer_memories;
            CREATE TRIGGER trigger_customer_memories_updated_at
                BEFORE UPDATE ON customer_memories
                FOR EACH ROW
                EXECUTE FUNCTION update_customer_memories_updated_at();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_customer_memories_updated_at ON customer_memories`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_customer_memories_updated_at()`);

    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_q_value"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_customer_key"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_memories_customer_type"`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_memories"`);

    // Eliminar enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."customer_memory_confidence_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."customer_memory_type_enum"`);
  }
}
