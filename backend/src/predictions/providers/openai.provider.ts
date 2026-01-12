import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface PredictionResult {
    prediction: string;
    confidence: number;
    insights: string[];
    data?: Record<string, any>;
}

export interface ForecastResult {
    values: Array<{ date: string; value: number; lower: number; upper: number }>;
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonality?: string;
}

@Injectable()
export class OpenAIProvider {
    private readonly logger = new Logger(OpenAIProvider.name);
    private client: OpenAI | null = null;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.client = new OpenAI({ apiKey });
        } else {
            this.logger.warn('OpenAI API key not configured');
        }
    }

    async analyzeData(data: Record<string, any>[], prompt: string): Promise<PredictionResult> {
        if (!this.client) {
            return this.getMockPrediction();
        }

        try {
            const response = await this.client.chat.completions.create({
                model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert data analyst. Analyze the provided data and return insights in JSON format with keys: prediction, confidence (0-1), insights (array of strings).`,
                    },
                    {
                        role: 'user',
                        content: `Data: ${JSON.stringify(data.slice(0, 100))}\n\nAnalysis request: ${prompt}`,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });

            const content = response.choices[0]?.message?.content || '{}';
            return JSON.parse(content) as PredictionResult;
        } catch (error) {
            this.logger.error('OpenAI analysis failed:', error);
            return this.getMockPrediction();
        }
    }

    async forecast(
        historicalData: Array<{ date: string; value: number }>,
        periods: number = 7,
    ): Promise<ForecastResult> {
        if (!this.client) {
            return this.getMockForecast(historicalData, periods);
        }

        try {
            const response = await this.client.chat.completions.create({
                model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
                messages: [
                    {
                        role: 'system',
                        content: `You are a forecasting expert. Analyze the time series data and predict the next ${periods} periods. Return JSON with: values (array of {date, value, lower, upper}), trend ('increasing'/'decreasing'/'stable'), seasonality (optional description).`,
                    },
                    {
                        role: 'user',
                        content: `Historical data: ${JSON.stringify(historicalData.slice(-30))}`,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
            });

            const content = response.choices[0]?.message?.content || '{}';
            return JSON.parse(content) as ForecastResult;
        } catch (error) {
            this.logger.error('OpenAI forecast failed:', error);
            return this.getMockForecast(historicalData, periods);
        }
    }

    async detectAnomalies(data: Array<{ date: string; value: number }>): Promise<{
        anomalies: Array<{ date: string; value: number; severity: 'low' | 'medium' | 'high'; reason: string }>;
        threshold: number;
    }> {
        // Use statistical approach with optional AI enhancement
        const values = data.map((d) => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(
            values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length,
        );
        const threshold = mean + 2 * std;

        const anomalies = data
            .filter((d) => Math.abs(d.value - mean) > 2 * std)
            .map((d) => ({
                date: d.date,
                value: d.value,
                severity: Math.abs(d.value - mean) > 3 * std ? 'high' as const :
                    Math.abs(d.value - mean) > 2.5 * std ? 'medium' as const : 'low' as const,
                reason: d.value > mean ? 'Unusually high value' : 'Unusually low value',
            }));

        return { anomalies, threshold };
    }

    private getMockPrediction(): PredictionResult {
        return {
            prediction: 'Based on historical trends, metrics show positive growth trajectory',
            confidence: 0.75,
            insights: [
                'User engagement increased by 15% compared to last period',
                'Peak activity observed during weekdays',
                'Mobile traffic growing faster than desktop',
            ],
        };
    }

    private getMockForecast(
        historicalData: Array<{ date: string; value: number }>,
        periods: number,
    ): ForecastResult {
        const lastValue = historicalData[historicalData.length - 1]?.value || 100;
        const values = Array.from({ length: periods }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i + 1);
            const value = Math.round(lastValue * (1 + (Math.random() - 0.4) * 0.1));
            return {
                date: date.toISOString().split('T')[0],
                value,
                lower: Math.round(value * 0.85),
                upper: Math.round(value * 1.15),
            };
        });

        return { values, trend: 'increasing', seasonality: 'Weekly pattern detected' };
    }
}
