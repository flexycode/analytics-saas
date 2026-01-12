import { Injectable, Logger } from '@nestjs/common';
import { OpenAIProvider, PredictionResult, ForecastResult } from './providers/openai.provider';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PredictionsService {
    private readonly logger = new Logger(PredictionsService.name);

    constructor(
        private readonly openAIProvider: OpenAIProvider,
        private readonly cacheService: CacheService,
    ) { }

    async getInsights(
        tenantId: string,
        data: Record<string, any>[],
        question: string,
    ): Promise<PredictionResult> {
        const cacheKey = this.cacheService.tenantKey(
            tenantId,
            `insights:${Buffer.from(question).toString('base64').slice(0, 50)}`,
        );

        return this.cacheService.wrap(
            cacheKey,
            () => this.openAIProvider.analyzeData(data, question),
            3600, // 1 hour cache
        );
    }

    async forecast(
        tenantId: string,
        metricName: string,
        historicalData: Array<{ date: string; value: number }>,
        periods: number = 7,
    ): Promise<ForecastResult> {
        const cacheKey = this.cacheService.tenantKey(
            tenantId,
            `forecast:${metricName}:${periods}`,
        );

        return this.cacheService.wrap(
            cacheKey,
            () => this.openAIProvider.forecast(historicalData, periods),
            3600,
        );
    }

    async detectAnomalies(
        tenantId: string,
        data: Array<{ date: string; value: number }>,
    ) {
        return this.openAIProvider.detectAnomalies(data);
    }

    async getTrendAnalysis(
        tenantId: string,
        data: Array<{ date: string; value: number }>,
    ): Promise<{
        trend: string;
        changePercent: number;
        summary: string;
    }> {
        if (data.length < 2) {
            return {
                trend: 'insufficient_data',
                changePercent: 0,
                summary: 'Not enough data points for trend analysis',
            };
        }

        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b.value, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b.value, 0) / secondHalf.length;

        const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

        let trend: string;
        if (changePercent > 10) trend = 'strong_growth';
        else if (changePercent > 2) trend = 'moderate_growth';
        else if (changePercent > -2) trend = 'stable';
        else if (changePercent > -10) trend = 'moderate_decline';
        else trend = 'strong_decline';

        return {
            trend,
            changePercent: Math.round(changePercent * 100) / 100,
            summary: this.getTrendSummary(trend, changePercent),
        };
    }

    private getTrendSummary(trend: string, changePercent: number): string {
        const absChange = Math.abs(changePercent).toFixed(1);
        switch (trend) {
            case 'strong_growth':
                return `Strong upward trend with ${absChange}% growth`;
            case 'moderate_growth':
                return `Steady growth of ${absChange}% observed`;
            case 'stable':
                return 'Metrics remain stable with minimal fluctuation';
            case 'moderate_decline':
                return `Slight decline of ${absChange}% detected`;
            case 'strong_decline':
                return `Significant decline of ${absChange}% requires attention`;
            default:
                return 'Trend analysis unavailable';
        }
    }
}
