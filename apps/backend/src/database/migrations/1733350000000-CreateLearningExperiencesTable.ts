import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migración para crear la tabla learning_experiences
 * Sistema JARVIS - Aprendizaje Continuo basado en Q-Learning
 */
export class CreateLearningExperiencesTable1733350000000
  implements MigrationInterface
{
  name = "CreateLearningExperiencesTable1733350000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear la tabla learning_experiences
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "learning_experiences" (
        "id" SERIAL PRIMARY KEY,

        -- Mensaje del usuario y respuesta
        "user_input" TEXT NOT NULL,
        "bot_response" TEXT NOT NULL,
        "ai_provider" VARCHAR(50) NOT NULL,

        -- Features de análisis
        "sentiment" FLOAT DEFAULT 0,
        "complexity" INTEGER DEFAULT 5,
        "intent" VARCHAR(100),
        "keywords" TEXT,
        "context_category" VARCHAR(50),

        -- Métricas de rendimiento
        "response_time_ms" INTEGER NOT NULL,
        "tokens_used" INTEGER,
        "from_cache" BOOLEAN DEFAULT false,

        -- Feedback y calidad
        "quality_score" INTEGER,
        "positive_continuation" BOOLEAN,
        "escalated_to_human" BOOLEAN DEFAULT false,
        "resulted_in_action" BOOLEAN,
        "action_type" VARCHAR(50),

        -- Contexto temporal
        "hour_of_day" INTEGER NOT NULL,
        "day_of_week" INTEGER NOT NULL,

        -- Q-Learning
        "state_key" VARCHAR(255),
        "action_taken" VARCHAR(100),
        "reward" FLOAT,

        -- Metadatos
        "conversation_id" INTEGER,
        "customer_id" INTEGER,
        "channel" VARCHAR(50),

        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Crear índices para optimizar consultas
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_learning_exp_intent_sentiment"
      ON "learning_experiences" ("intent", "sentiment");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_learning_exp_created_at"
      ON "learning_experiences" ("created_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_learning_exp_conversation"
      ON "learning_experiences" ("conversation_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_learning_exp_customer"
      ON "learning_experiences" ("customer_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_learning_exp_ai_provider"
      ON "learning_experiences" ("ai_provider");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_learning_exp_state_key"
      ON "learning_experiences" ("state_key");
    `);

    console.log("✅ Tabla learning_experiences creada exitosamente");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_learning_exp_state_key"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_learning_exp_ai_provider"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_learning_exp_customer"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_learning_exp_conversation"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_learning_exp_created_at"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_learning_exp_intent_sentiment"`
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS "learning_experiences"`);

    console.log("✅ Tabla learning_experiences eliminada");
  }
}
