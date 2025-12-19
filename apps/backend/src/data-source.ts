import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// 1. Carga el .env según NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
loadEnv({ path: envFile });

// 2. Debug: comprueba valores
console.log('--- ENV DEBUG ---');
console.log('NODE_ENV :', process.env.NODE_ENV);
console.log('ENV FILE :', envFile);
console.log('DB_HOST  :', process.env.DATABASE_HOST);
console.log('DB_PORT  :', process.env.DATABASE_PORT);
console.log('DB_NAME  :', process.env.DATABASE_NAME);
console.log('--------------');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '15432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'supersecret',
  database: process.env.DATABASE_NAME || 'chatbotdysa',
  namingStrategy: new SnakeNamingStrategy(),
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true, ca: process.env.DB_CA }
      : false,
  entities: [
    join(
      __dirname,
      process.env.NODE_ENV === 'production' ? '../dist/**/*.entity.js' : '**/*.entity.{ts,js}'
    ),
  ],
  migrations: [
    join(
      __dirname,
      process.env.NODE_ENV === 'production' ? '../dist/migrations/*.js' : 'migrations/*.{ts,js}'
    ),
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || '50', 10),
    min: parseInt(process.env.DB_POOL_MIN || '5', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
  },
});

// Enterprise Health Check Function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: any;
  timestamp: Date;
}> {
  try {
    const startTime = Date.now();

    // Check basic connectivity
    await AppDataSource.query('SELECT 1 as health_check');

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      details: {
        responseTime: `${responseTime}ms`,
        database: AppDataSource.options.database,
        host: (AppDataSource.options as any).host,
        ssl: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled',
      },
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        database: AppDataSource.options.database,
        host: (AppDataSource.options as any).host,
      },
      timestamp: new Date(),
    };
  }
}

// Initialize connection with enterprise error handling
export async function initializeDataSource(): Promise<void> {
  try {
    console.log('🚀 Initializing Enterprise DataSource...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Enterprise DataSource initialized successfully');

      // Run health check
      const health = await checkDatabaseHealth();
      console.log('🏥 Database Health Check:', health);

      // Log configuration (without sensitive data)
      console.log('📊 Database Configuration:', {
        host: (AppDataSource.options as any).host,
        database: AppDataSource.options.database,
        ssl: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled',
        poolMax: AppDataSource.options.extra?.max,
        poolMin: AppDataSource.options.extra?.min,
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize Enterprise DataSource:', error);

    // Enterprise error handling
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }

    throw error;
  }
}

// Graceful shutdown
export async function closeDataSource(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Enterprise DataSource closed gracefully');
    }
  } catch (error) {
    console.error('❌ Error closing DataSource:', error);
    throw error;
  }
}

export default AppDataSource;
