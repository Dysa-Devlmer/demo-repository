import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAlertsInboxAckFields1735000100000 implements MigrationInterface {
  name = 'AddAlertsInboxAckFields1735000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts_inbox" ADD COLUMN IF NOT EXISTS "acknowledged_at" timestamptz NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_inbox" ADD COLUMN IF NOT EXISTS "acknowledged_by" text NULL`
    );
    await queryRunner.query(`ALTER TABLE "alerts_inbox" ADD COLUMN IF NOT EXISTS "ack_note" text NULL`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_alerts_inbox_acknowledged_at" ON "alerts_inbox" ("acknowledged_at")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_alerts_inbox_acknowledged_at"`);
    await queryRunner.query(`ALTER TABLE "alerts_inbox" DROP COLUMN IF EXISTS "ack_note"`);
    await queryRunner.query(`ALTER TABLE "alerts_inbox" DROP COLUMN IF EXISTS "acknowledged_by"`);
    await queryRunner.query(`ALTER TABLE "alerts_inbox" DROP COLUMN IF EXISTS "acknowledged_at"`);
  }
}
