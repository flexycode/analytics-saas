import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormat } from '../entities/report-template.entity';

export class GenerateReportDto {
    @ApiProperty({ description: 'Template ID to generate report from' })
    @IsUUID()
    @IsNotEmpty()
    templateId: string;

    @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.PDF })
    @IsOptional()
    @IsEnum(ReportFormat)
    format?: ReportFormat;
}
