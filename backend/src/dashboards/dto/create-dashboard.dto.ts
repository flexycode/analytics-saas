import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDashboardDto {
    @ApiProperty({ example: 'Sales Overview' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Dashboard for tracking sales metrics' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isShared?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    layout?: Record<string, any>;
}
