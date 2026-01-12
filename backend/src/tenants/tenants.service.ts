import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, SubscriptionTier } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
    private readonly logger = new Logger(TenantsService.name);

    constructor(
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) { }

    async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
        const existingTenant = await this.tenantRepository.findOne({
            where: { subdomain: createTenantDto.subdomain },
        });

        if (existingTenant) {
            throw new ConflictException('Subdomain already exists');
        }

        const tenant = this.tenantRepository.create({
            ...createTenantDto,
            limits: this.getDefaultLimits(createTenantDto.subscriptionTier),
        });

        await this.tenantRepository.save(tenant);
        this.logger.log(`Tenant created: ${tenant.subdomain}`);
        return tenant;
    }

    async findAll(): Promise<Tenant[]> {
        return this.tenantRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Tenant> {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }

    async findBySubdomain(subdomain: string): Promise<Tenant | null> {
        return this.tenantRepository.findOne({ where: { subdomain } });
    }

    async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
        const tenant = await this.findOne(id);

        if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
            const existingTenant = await this.findBySubdomain(updateTenantDto.subdomain);
            if (existingTenant) {
                throw new ConflictException('Subdomain already exists');
            }
        }

        Object.assign(tenant, updateTenantDto);

        // Update limits if subscription tier changed
        if (updateTenantDto.subscriptionTier) {
            tenant.limits = this.getDefaultLimits(updateTenantDto.subscriptionTier);
        }

        return this.tenantRepository.save(tenant);
    }

    async remove(id: string): Promise<void> {
        const tenant = await this.findOne(id);
        await this.tenantRepository.remove(tenant);
        this.logger.log(`Tenant deleted: ${id}`);
    }

    private getDefaultLimits(tier: SubscriptionTier = SubscriptionTier.FREE): Tenant['limits'] {
        const tierLimits: Record<SubscriptionTier, Tenant['limits']> = {
            [SubscriptionTier.FREE]: {
                maxUsers: 5,
                maxDashboards: 3,
                maxReports: 10,
                dataRetentionDays: 30,
                apiRateLimit: 100,
            },
            [SubscriptionTier.STARTER]: {
                maxUsers: 25,
                maxDashboards: 10,
                maxReports: 50,
                dataRetentionDays: 90,
                apiRateLimit: 500,
            },
            [SubscriptionTier.PROFESSIONAL]: {
                maxUsers: 100,
                maxDashboards: 50,
                maxReports: 200,
                dataRetentionDays: 365,
                apiRateLimit: 2000,
            },
            [SubscriptionTier.ENTERPRISE]: {
                maxUsers: -1, // unlimited
                maxDashboards: -1,
                maxReports: -1,
                dataRetentionDays: -1,
                apiRateLimit: 10000,
            },
        };

        return tierLimits[tier];
    }
}
