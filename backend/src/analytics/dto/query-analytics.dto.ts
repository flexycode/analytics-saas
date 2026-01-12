import { IsOptional, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryAnalyticsDto {
    @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ example: '2024-01-31T23:59:59Z' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ example: 'page_view' })
    @IsOptional()
    @IsString()
    eventType?: string;

    @ApiPropertyOptional({ example: 'user-123' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ example: 100, default: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(1000)
    limit?: number;

    @ApiPropertyOptional({ example: 0, default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number;
}
