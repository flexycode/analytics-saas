import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionTier } from '../entities/tenant.entity';

export class CreateTenantDto {
    @ApiProperty({ example: 'Acme Corporation' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 'acme', description: 'URL-safe subdomain' })
    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens only' })
    @MaxLength(63)
    subdomain: string;

    @ApiPropertyOptional({ example: 'acme.analytics.com' })
    @IsOptional()
    @IsString()
    domain?: string;

    @ApiPropertyOptional({ enum: SubscriptionTier, default: SubscriptionTier.FREE })
    @IsOptional()
    @IsEnum(SubscriptionTier)
    subscriptionTier?: SubscriptionTier;

    @ApiPropertyOptional({ example: 'billing@acme.com' })
    @IsOptional()
    @IsString()
    billingEmail?: string;
}
