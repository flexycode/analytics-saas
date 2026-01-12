import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Basic health check' })
    check() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Get('detailed')
    @HealthCheck()
    @ApiOperation({ summary: 'Detailed health check with dependencies' })
    checkDetailed() {
        return this.health.check([
            () => this.db.pingCheck('database'),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
        ]);
    }

    @Get('ready')
    @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
    ready() {
        return { status: 'ready', timestamp: new Date().toISOString() };
    }

    @Get('live')
    @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
    live() {
        return { status: 'alive', timestamp: new Date().toISOString() };
    }
}
