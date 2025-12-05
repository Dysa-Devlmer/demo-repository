/**
 * Migration: Add Audit Log Indexes
 * ChatBotDysa Enterprise
 *
 * Agrega índices optimizados a la tabla de auditoría existente
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLogIndexes1732048200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear índices si no existen (usando IF NOT EXISTS)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_userId_createdAt"
      ON "audit_logs" ("userId", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action_createdAt"
      ON "audit_logs" ("action", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_severity_createdAt"
      ON "audit_logs" ("severity", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_ipAddress_createdAt"
      ON "audit_logs" ("ipAddress", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_createdAt"
      ON "audit_logs" ("createdAt")
    `);

    console.log('✅ Índices de auditoría creados exitosamente');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_userId_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_action_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_severity_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_ipAddress_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_createdAt"`);
  }
}
