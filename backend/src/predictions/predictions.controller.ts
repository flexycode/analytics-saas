import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('predictions')
@Controller('predictions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PredictionsController {
    constructor(private readonly predictionsService: PredictionsService) { }

    @Post('insights')
    @ApiOperation({ summary: 'Get AI-powered insights from data' })
    @ApiResponse({ status: 200, description: 'AI insights' })
    async getInsights(
        @CurrentUser() user: JwtPayload,
        @Body() body: { data: Record<string, any>[]; question: string },
    ) {
        return this.predictionsService.getInsights(user.tenantId!, body.data, body.question);
    }

    @Post('forecast')
    @ApiOperation({ summary: 'Get time series forecast' })
    @ApiResponse({ status: 200, description: 'Forecast results' })
    async forecast(
        @CurrentUser() user: JwtPayload,
        @Body() body: {
            metricName: string;
            historicalData: Array<{ date: string; value: number }>;
            periods?: number;
        },
    ) {
        return this.predictionsService.forecast(
            user.tenantId!,
            body.metricName,
            body.historicalData,
            body.periods,
        );
    }

    @Post('anomalies')
    @ApiOperation({ summary: 'Detect anomalies in data' })
    @ApiResponse({ status: 200, description: 'Detected anomalies' })
    async detectAnomalies(
        @CurrentUser() user: JwtPayload,
        @Body() body: { data: Array<{ date: string; value: number }> },
    ) {
        return this.predictionsService.detectAnomalies(user.tenantId!, body.data);
    }

    @Post('trends')
    @ApiOperation({ summary: 'Analyze trends in data' })
    @ApiResponse({ status: 200, description: 'Trend analysis' })
    async analyzeTrends(
        @CurrentUser() user: JwtPayload,
        @Body() body: { data: Array<{ date: string; value: number }> },
    ) {
        return this.predictionsService.getTrendAnalysis(user.tenantId!, body.data);
    }
}
