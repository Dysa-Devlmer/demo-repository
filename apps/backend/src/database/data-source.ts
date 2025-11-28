import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '15432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'supersecret',
  database: process.env.DATABASE_NAME || 'chatbotdysa',
  entities: [join(__dirname, '..', '**', 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false, // ⚠️ IMPORTANTE: false en producción
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: false, // Ejecutar manualmente
  migrationsTableName: 'migrations_history',
});
