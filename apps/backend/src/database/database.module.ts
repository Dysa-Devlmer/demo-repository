import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DatabaseService } from "./database.service";
import * as entities from "./entities";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-ioredis-yet";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DATABASE_HOST", "localhost"),
        port: config.get<number>("DATABASE_PORT", 5432),
        username: config.get<string>("DATABASE_USER", "postgres"),
        password:
          config.get<string>("DATABASE_PASS") ??
          config.get<string>("DATABASE_PASSWORD", "supersecret"),
        database: config.get<string>("DATABASE_NAME", "chatbotdysa"),
        entities: Object.values(entities),
        // ⚠️ IMPORTANTE: synchronize debe ser false cuando usas migraciones
        synchronize: false, // SIEMPRE false - usamos migraciones para control de schema
        migrationsRun: false, // DESHABILITADO: ejecutar manualmente con npm run typeorm:run
        migrations: [__dirname + "/migrations/*{.ts,.js}"],
        migrationsTableName: "migrations", // Nombre correcto de la tabla
        autoLoadEntities: true,
        retryAttempts: 10,
        retryDelay: 3000,
        logging: ["error", "migration"],
        ssl: false,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisHost = config.get<string>("REDIS_HOST", "redis");
        const redisPort = config.get<number>("REDIS_PORT", 6379);

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
