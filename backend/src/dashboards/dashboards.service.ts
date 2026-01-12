import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { Widget } from './entities/widget.entity';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class DashboardsService {
    constructor(
        @InjectRepository(Dashboard)
        private readonly dashboardRepository: Repository<Dashboard>,
        @InjectRepository(Widget)
        private readonly widgetRepository: Repository<Widget>,
        private readonly cacheService: CacheService,
    ) { }

    async create(tenantId: string, userId: string, dto: CreateDashboardDto): Promise<Dashboard> {
        const dashboard = this.dashboardRepository.create({
            tenantId,
            createdBy: userId,
            ...dto,
        });

        return this.dashboardRepository.save(dashboard);
    }

    async findAll(tenantId: string, userId: string): Promise<Dashboard[]> {
        return this.dashboardRepository.find({
            where: [
                { tenantId, createdBy: userId },
                { tenantId, isShared: true },
            ],
            relations: ['widgets'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, tenantId: string, userId: string): Promise<Dashboard> {
        const dashboard = await this.dashboardRepository.findOne({
            where: { id, tenantId },
            relations: ['widgets'],
        });

        if (!dashboard) {
            throw new NotFoundException(`Dashboard with ID ${id} not found`);
        }

        if (dashboard.createdBy !== userId && !dashboard.isShared) {
            throw new ForbiddenException('Access denied');
        }

        return dashboard;
    }

    async update(id: string, tenantId: string, userId: string, dto: UpdateDashboardDto): Promise<Dashboard> {
        const dashboard = await this.findOne(id, tenantId, userId);

        if (dashboard.createdBy !== userId) {
            throw new ForbiddenException('Only the owner can update this dashboard');
        }

        Object.assign(dashboard, dto);
        return this.dashboardRepository.save(dashboard);
    }

    async remove(id: string, tenantId: string, userId: string): Promise<void> {
        const dashboard = await this.findOne(id, tenantId, userId);

        if (dashboard.createdBy !== userId) {
            throw new ForbiddenException('Only the owner can delete this dashboard');
        }

        await this.dashboardRepository.remove(dashboard);
    }

    async addWidget(dashboardId: string, tenantId: string, userId: string, widget: Partial<Widget>): Promise<Widget> {
        await this.findOne(dashboardId, tenantId, userId); // Verify access

        const newWidget = this.widgetRepository.create({
            dashboardId,
            ...widget,
        });

        return this.widgetRepository.save(newWidget);
    }

    async updateWidget(widgetId: string, tenantId: string, userId: string, updates: Partial<Widget>): Promise<Widget> {
        const widget = await this.widgetRepository.findOne({
            where: { id: widgetId },
            relations: ['dashboard'],
        });

        if (!widget || widget.dashboard.tenantId !== tenantId) {
            throw new NotFoundException('Widget not found');
        }

        Object.assign(widget, updates);
        return this.widgetRepository.save(widget);
    }

    async removeWidget(widgetId: string, tenantId: string, userId: string): Promise<void> {
        const widget = await this.widgetRepository.findOne({
            where: { id: widgetId },
            relations: ['dashboard'],
        });

        if (!widget || widget.dashboard.tenantId !== tenantId) {
            throw new NotFoundException('Widget not found');
        }

        await this.widgetRepository.remove(widget);
    }
}
