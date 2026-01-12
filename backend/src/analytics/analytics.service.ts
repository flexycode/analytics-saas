import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { Metric, MetricGranularity } from './entities/metric.entity';
import { TrackEventDto } from './dto/track-event.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectRepository(Metric)
        private readonly metricRepository: Repository<Metric>,
        private readonly cacheService: CacheService,
    ) { }

    async trackEvent(tenantId: string, trackEventDto: TrackEventDto): Promise<Event> {
        const event = this.eventRepository.create({
            tenantId,
            ...trackEventDto,
        });

        await this.eventRepository.save(event);
        this.logger.debug(`Event tracked: ${trackEventDto.eventType} for tenant ${tenantId}`);

        return event;
    }

    async trackBatch(tenantId: string, events: TrackEventDto[]): Promise<number> {
        const eventEntities = events.map((e) =>
            this.eventRepository.create({ tenantId, ...e }),
        );

        await this.eventRepository.save(eventEntities, { chunk: 100 });
        return eventEntities.length;
    }

    async queryEvents(tenantId: string, query: QueryAnalyticsDto) {
        const cacheKey = this.cacheService.tenantKey(tenantId, `events:${JSON.stringify(query)}`);

        return this.cacheService.wrap(cacheKey, async () => {
            const qb = this.eventRepository
                .createQueryBuilder('event')
                .where('event.tenantId = :tenantId', { tenantId });

            if (query.startDate && query.endDate) {
                qb.andWhere('event.createdAt BETWEEN :start AND :end', {
                    start: query.startDate,
                    end: query.endDate,
                });
            }

            if (query.eventType) {
                qb.andWhere('event.eventType = :eventType', { eventType: query.eventType });
            }

            if (query.userId) {
                qb.andWhere('event.userId = :userId', { userId: query.userId });
            }

            qb.orderBy('event.createdAt', 'DESC')
                .take(query.limit || 100)
                .skip(query.offset || 0);

            const [events, total] = await qb.getManyAndCount();

            return { events, total, limit: query.limit, offset: query.offset };
        }, 300); // 5 minute cache
    }

    async getMetrics(
        tenantId: string,
        metricNames: string[],
        startDate: Date,
        endDate: Date,
        granularity: MetricGranularity = MetricGranularity.DAY,
    ) {
        const cacheKey = this.cacheService.tenantKey(
            tenantId,
            `metrics:${metricNames.join(',')}:${startDate.toISOString()}:${endDate.toISOString()}:${granularity}`,
        );

        return this.cacheService.wrap(cacheKey, async () => {
            return this.metricRepository.find({
                where: {
                    tenantId,
                    granularity,
                    periodStart: Between(startDate, endDate),
                },
                order: { periodStart: 'ASC' },
            });
        }, 300);
    }

    async getDashboardOverview(tenantId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const cacheKey = this.cacheService.tenantKey(tenantId, `overview:${days}`);

        return this.cacheService.wrap(cacheKey, async () => {
            // Get event counts by type
            const eventCounts = await this.eventRepository
                .createQueryBuilder('event')
                .select('event.eventType', 'eventType')
                .addSelect('COUNT(*)', 'count')
                .where('event.tenantId = :tenantId', { tenantId })
                .andWhere('event.createdAt >= :startDate', { startDate })
                .groupBy('event.eventType')
                .getRawMany();

            // Get daily event counts for trend
            const dailyTrend = await this.eventRepository
                .createQueryBuilder('event')
                .select("DATE_TRUNC('day', event.createdAt)", 'date')
                .addSelect('COUNT(*)', 'count')
                .where('event.tenantId = :tenantId', { tenantId })
                .andWhere('event.createdAt >= :startDate', { startDate })
                .groupBy("DATE_TRUNC('day', event.createdAt)")
                .orderBy('date', 'ASC')
                .getRawMany();

            // Get unique users
            const uniqueUsers = await this.eventRepository
                .createQueryBuilder('event')
                .select('COUNT(DISTINCT event.userId)', 'count')
                .where('event.tenantId = :tenantId', { tenantId })
                .andWhere('event.createdAt >= :startDate', { startDate })
                .getRawOne();

            // Get total events
            const totalEvents = await this.eventRepository.count({
                where: { tenantId },
            });

            return {
                totalEvents,
                uniqueUsers: parseInt(uniqueUsers?.count || '0'),
                eventCounts,
                dailyTrend,
                period: { startDate, endDate: new Date(), days },
            };
        }, 300);
    }
}
