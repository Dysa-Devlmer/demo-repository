import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import * as entities from './entities';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isTest =
          config.get<string>('NODE_ENV') === 'test' || Boolean(process.env.JEST_WORKER_ID);
        const databaseHost = isTest
          ? process.env.DATABASE_HOST || '127.0.0.1'
          : config.get<string>('DATABASE_HOST', 'localhost');
        const databasePort = isTest
          ? Number(process.env.DATABASE_PORT) || 5432
          : Number(config.get<string>('DATABASE_PORT')) || 5432;
        const databaseName = isTest
          ? process.env.DATABASE_NAME || 'chatbotdysa_test'
          : config.get<string>('DATABASE_NAME', 'chatbotdysa');
        const databaseUser = isTest
          ? process.env.DATABASE_USER || 'postgres'
          : config.get<string>('DATABASE_USER', 'postgres');
        const databasePassword = isTest
          ? process.env.DATABASE_PASS ||
            process.env.DATABASE_PASSWORD ||
            'supersecret'
          : config.get<string>('DATABASE_PASS') ??
            config.get<string>('DATABASE_PASSWORD', 'supersecret');

        return {
          type: 'postgres',
          host: databaseHost,
          port: databasePort,
          username: databaseUser,
          password: databasePassword,
          database: databaseName,
          entities: Object.values(entities),
          // ⚠️ IMPORTANTE: synchronize debe ser false cuando usas migraciones
          synchronize: isTest, // en tests se habilita para crear schema automaticamente
          dropSchema: isTest, // limpiar schema de tests para evitar conflictos
          migrationsRun: false, // DESHABILITADO: ejecutar manualmente con npm run typeorm:run
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsTableName: 'migrations', // Nombre correcto de la tabla
          autoLoadEntities: true,
          retryAttempts: isTest ? 3 : 10,
          retryDelay: isTest ? 500 : 3000,
          logging: isTest ? ['error'] : ['error', 'migration'],
          ssl: false,
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const isTest =
          config.get<string>('NODE_ENV') === 'test' || Boolean(process.env.JEST_WORKER_ID);

        if (isTest) {
          return {
            ttl: 60 * 5,
            max: 1000,
          };
        }

        const redisHost = isTest
          ? process.env.REDIS_HOST || '127.0.0.1'
          : config.get<string>('REDIS_HOST', 'redis');
        const redisPort = isTest
          ? Number(process.env.REDIS_PORT) || 6379
          : Number(config.get<string>('REDIS_PORT')) || 6379;

        console.log(`[Redis] Connecting to ${redisHost}:${redisPort}`);

        return {
          store: await redisStore({
            host: redisHost,
            port: redisPort,
            connectTimeout: 10000,
            lazyConnect: false,
            ttl: 60 * 5, // cache 5 min
            retryStrategy: (times: number) => {
              const delay = Math.min(times * 50, 2000);
              console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
              return delay;
            },
            reconnectOnError: (err: Error) => {
              console.error('[Redis] Connection error:', err.message);
              return true; // Always try to reconnect
            },
          }),
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule, CacheModule],
})
export class DatabaseModule {}
