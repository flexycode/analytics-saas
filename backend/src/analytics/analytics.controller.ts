import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post('track')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Track a single event' })
    @ApiResponse({ status: 201, description: 'Event tracked successfully' })
    async trackEvent(
        @CurrentUser() user: JwtPayload,
        @Body() trackEventDto: TrackEventDto,
    ) {
        const event = await this.analyticsService.trackEvent(user.tenantId!, trackEventDto);
        return { success: true, eventId: event.id };
    }

    @Post('track/batch')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Track multiple events in batch' })
    @ApiResponse({ status: 201, description: 'Events tracked successfully' })
    async trackBatch(
        @CurrentUser() user: JwtPayload,
        @Body() events: TrackEventDto[],
    ) {
        const count = await this.analyticsService.trackBatch(user.tenantId!, events);
        return { success: true, count };
    }

    @Get('events')
    @ApiOperation({ summary: 'Query events with filters' })
    @ApiResponse({ status: 200, description: 'List of events' })
    async queryEvents(
        @CurrentUser() user: JwtPayload,
        @Query() query: QueryAnalyticsDto,
    ) {
        return this.analyticsService.queryEvents(user.tenantId!, query);
    }

    @Get('overview')
    @ApiOperation({ summary: 'Get dashboard overview statistics' })
    @ApiResponse({ status: 200, description: 'Dashboard overview' })
    async getOverview(
        @CurrentUser() user: JwtPayload,
        @Query('days') days?: number,
    ) {
        return this.analyticsService.getDashboardOverview(user.tenantId!, days);
    }
}
