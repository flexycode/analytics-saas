import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackEventDto {
    @ApiProperty({ example: 'page_view', description: 'Type of event' })
    @IsString()
    @IsNotEmpty()
    eventType: string;

    @ApiPropertyOptional({ example: 'Homepage View' })
    @IsOptional()
    @IsString()
    eventName?: string;

    @ApiPropertyOptional({ example: { page: '/home', duration: 5000 } })
    @IsOptional()
    properties?: Record<string, any>;

    @ApiPropertyOptional({ example: 'user-123' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ example: 'session-456' })
    @IsOptional()
    @IsString()
    sessionId?: string;

    @ApiPropertyOptional({ example: 'https://example.com/home' })
    @IsOptional()
    @IsString()
    pageUrl?: string;

    @ApiPropertyOptional({ example: 'https://google.com' })
    @IsOptional()
    @IsString()
    referrer?: string;
}
