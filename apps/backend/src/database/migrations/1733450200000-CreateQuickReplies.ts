import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuickReplies1733450200000 implements MigrationInterface {
  name = 'CreateQuickReplies1733450200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for quick reply category
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."quick_replies_category_enum" AS ENUM('greeting', 'farewell', 'info', 'support', 'sales', 'custom');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    // Create quick_replies table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "quick_replies" (
                "id" SERIAL NOT NULL,
                "title" character varying NOT NULL,
                "content" text NOT NULL,
                "category" "public"."quick_replies_category_enum" NOT NULL DEFAULT 'custom',
                "shortcut" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "usage_count" integer NOT NULL DEFAULT 0,
                "variables" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_quick_replies" PRIMARY KEY ("id")
            )
        `);

    // Create index for shortcut lookup
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_quick_replies_shortcut" ON "quick_replies" ("shortcut")
        `);

    // Create index for category filtering
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_quick_replies_category" ON "quick_replies" ("category")
        `);

    // Create index for active replies
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_quick_replies_active" ON "quick_replies" ("is_active")
        `);

    // Insert default quick replies
    await queryRunner.query(`
            INSERT INTO "quick_replies" ("title", "content", "category", "shortcut", "variables") VALUES
            ('Saludo', '¡Hola {nombre}! Bienvenido/a a ChatBotDysa. ¿En qué puedo ayudarte hoy?', 'greeting', '/saludo', '["nombre"]'),
            ('Despedida', '¡Gracias por contactarnos! Si tienes más preguntas, no dudes en escribirnos. ¡Que tengas un excelente día!', 'farewell', '/despedida', '[]'),
            ('Horario de atención', 'Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 hrs. ¿Hay algo más en lo que pueda ayudarte?', 'info', '/horario', '[]'),
            ('En espera', 'Gracias por tu paciencia. Un agente te atenderá en breve.', 'support', '/espera', '[]'),
            ('Transferir a agente', 'Entiendo tu consulta. Voy a transferirte con un agente especializado que podrá ayudarte mejor. Por favor espera un momento.', 'support', '/transferir', '[]'),
            ('Promociones', '¡Tenemos promociones especiales para ti! Visita nuestra sección de ofertas o pregúntame por nuestras promociones actuales.', 'sales', '/promo', '[]'),
            ('Confirmar pedido', 'Tu pedido #{pedido} ha sido confirmado. Te notificaremos cuando esté listo. ¡Gracias por tu preferencia!', 'sales', '/confirmarpedido', '["pedido"]'),
            ('Problema técnico', 'Lamentamos los inconvenientes. Nuestro equipo técnico está trabajando para resolver el problema. Te mantendremos informado.', 'support', '/tecnico', '[]')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quick_replies_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quick_replies_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quick_replies_shortcut"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "quick_replies"`);

    // Remove enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."quick_replies_category_enum"`);
  }
}
