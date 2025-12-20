import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlertsInbox1735000000000 implements MigrationInterface {
  name = 'CreateAlertsInbox1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "alerts_inbox" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "source" text NOT NULL,
        "status" text NOT NULL,
        "alertname" text NOT NULL,
        "severity" text,
        "instance" text,
        "job" text,
        "payload" jsonb NOT NULL,
        "fingerprint" text NOT NULL,
        CONSTRAINT "PK_alerts_inbox_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_alerts_inbox_fingerprint" UNIQUE ("fingerprint")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_alerts_inbox_source" ON "alerts_inbox" ("source")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_alerts_inbox_status" ON "alerts_inbox" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_alerts_inbox_alertname" ON "alerts_inbox" ("alertname")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_alerts_inbox_fingerprint" ON "alerts_inbox" ("fingerprint")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_alerts_inbox_fingerprint"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_alerts_inbox_alertname"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_alerts_inbox_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_alerts_inbox_source"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "alerts_inbox"`);
  }
}
