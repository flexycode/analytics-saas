import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportTemplate } from './entities/report-template.entity';
import { ScheduledReport } from './entities/scheduled-report.entity';
import { ReportRun } from './entities/report-run.entity';
import { ReportProcessor } from './processors/report.processor';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReportTemplate, ScheduledReport, ReportRun]),
        BullModule.registerQueue({ name: 'reports' }),
    ],
    controllers: [ReportsController],
    providers: [ReportsService, ReportProcessor],
    exports: [ReportsService],
})
export class ReportsModule { }
