import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversationMode1733450000000 implements MigrationInterface {
  name = 'AddConversationMode1733450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for conversation mode
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."conversations_mode_enum" AS ENUM('auto', 'manual', 'hybrid');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    // Add mode column to conversations table with default value 'auto'
    await queryRunner.query(`
            ALTER TABLE "conversations"
            ADD COLUMN IF NOT EXISTS "mode" "public"."conversations_mode_enum" NOT NULL DEFAULT 'auto'
        `);

    // Add index for mode column for faster filtering
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_conversations_mode" ON "conversations" ("mode")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_mode"`);

    // Remove column
    await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN IF EXISTS "mode"`);

    // Remove enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."conversations_mode_enum"`);
  }
}
