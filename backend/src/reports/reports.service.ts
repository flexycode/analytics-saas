import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ReportTemplate, ReportFormat } from './entities/report-template.entity';
import { ScheduledReport } from './entities/scheduled-report.entity';
import { ReportRun, ReportRunStatus } from './entities/report-run.entity';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        @InjectRepository(ReportTemplate)
        private readonly templateRepository: Repository<ReportTemplate>,
        @InjectRepository(ScheduledReport)
        private readonly scheduledRepository: Repository<ScheduledReport>,
        @InjectRepository(ReportRun)
        private readonly runRepository: Repository<ReportRun>,
        @InjectQueue('reports')
        private readonly reportsQueue: Queue,
    ) { }

    // Templates
    async createTemplate(tenantId: string, userId: string, dto: CreateReportTemplateDto): Promise<ReportTemplate> {
        const template = this.templateRepository.create({
            tenantId,
            createdBy: userId,
            ...dto,
        });
        return this.templateRepository.save(template);
    }

    async findAllTemplates(tenantId: string): Promise<ReportTemplate[]> {
        return this.templateRepository.find({
            where: { tenantId, isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findTemplate(id: string, tenantId: string): Promise<ReportTemplate> {
        const template = await this.templateRepository.findOne({
            where: { id, tenantId },
        });
        if (!template) {
            throw new NotFoundException('Report template not found');
        }
        return template;
    }

    // Generate report
    async generateReport(
        tenantId: string,
        userId: string,
        templateId: string,
        format: ReportFormat = ReportFormat.PDF,
    ): Promise<ReportRun> {
        const template = await this.findTemplate(templateId, tenantId);

        const run = this.runRepository.create({
            tenantId,
            templateId,
            format,
            requestedBy: userId,
            status: ReportRunStatus.PENDING,
        });

        await this.runRepository.save(run);

        // Add to processing queue
        await this.reportsQueue.add('generate', {
            runId: run.id,
            tenantId,
            templateId,
            format,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });

        this.logger.log(`Report generation queued: ${run.id}`);
        return run;
    }

    async getRunStatus(runId: string, tenantId: string): Promise<ReportRun> {
        const run = await this.runRepository.findOne({
            where: { id: runId, tenantId },
        });
        if (!run) {
            throw new NotFoundException('Report run not found');
        }
        return run;
    }

    async getRunHistory(tenantId: string, limit: number = 20): Promise<ReportRun[]> {
        return this.runRepository.find({
            where: { tenantId },
            relations: ['template'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    // Used by processor
    async updateRunStatus(
        runId: string,
        status: ReportRunStatus,
        updates?: Partial<ReportRun>,
    ): Promise<void> {
        await this.runRepository.update(runId, { status, ...updates });
    }
}
