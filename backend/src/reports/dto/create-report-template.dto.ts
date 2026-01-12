import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormat } from '../entities/report-template.entity';

export class CreateReportTemplateDto {
    @ApiProperty({ example: 'Weekly Sales Report' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Weekly summary of sales metrics' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    config: {
        title: string;
        sections: Array<{
            type: 'summary' | 'chart' | 'table' | 'text';
            title?: string;
            dataSource?: Record<string, any>;
            options?: Record<string, any>;
        }>;
        dateRange?: Record<string, any>;
        filters?: Record<string, any>;
    };

    @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.PDF })
    @IsOptional()
    @IsEnum(ReportFormat)
    defaultFormat?: ReportFormat;
}
