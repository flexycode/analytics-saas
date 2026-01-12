import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('BACKEND_PORT', 4000);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // Security
    app.use(helmet());

    // CORS
    app.enableCors({
        origin: nodeEnv === 'production'
            ? configService.get<string>('FRONTEND_URL')
            : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
    });

    // API Versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Swagger Documentation
    if (nodeEnv !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Analytics SaaS API')
            .setDescription('Enterprise-grade analytics platform API documentation')
            .setVersion('1.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    description: 'Enter your JWT token',
                    in: 'header',
                },
                'access-token',
            )
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management')
            .addTag('tenants', 'Multi-tenancy management')
            .addTag('analytics', 'Analytics data endpoints')
            .addTag('dashboards', 'Dashboard management')
            .addTag('reports', 'Automated reporting')
            .addTag('predictions', 'AI/ML predictions')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        logger.log(`Swagger documentation available at /api/docs`);
    }

    // Graceful shutdown
    app.enableShutdownHooks();

    await app.listen(port);
    logger.log(`🚀 Application running on port ${port}`);
    logger.log(`📊 Environment: ${nodeEnv}`);
}

bootstrap();
