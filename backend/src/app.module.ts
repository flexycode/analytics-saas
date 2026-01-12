import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ReportsModule } from './reports/reports.module';
import { PredictionsModule } from './predictions/predictions.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';

// Configuration
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: databaseConfig,
        }),

        // Rate Limiting
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ([{
                ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
                limit: config.get<number>('RATE_LIMIT_LIMIT', 100),
            }]),
        }),

        // Bull Queue (Redis-backed)
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: redisConfig,
        }),

        // Feature Modules
        HealthModule,
        CacheModule,
        AuthModule,
        UsersModule,
        TenantsModule,
        AnalyticsModule,
        DashboardsModule,
        ReportsModule,
        PredictionsModule,
    ],
})
export class AppModule { }
