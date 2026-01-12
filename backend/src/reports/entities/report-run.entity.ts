import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { ReportTemplate, ReportFormat } from './report-template.entity';

export enum ReportRunStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('report_runs')
@Index(['tenantId', 'createdAt'])
@Index(['status'])
export class ReportRun {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    templateId: string;

    @ManyToOne(() => ReportTemplate)
    @JoinColumn({ name: 'templateId' })
    template: ReportTemplate;

    @Column({ type: 'enum', enum: ReportRunStatus, default: ReportRunStatus.PENDING })
    status: ReportRunStatus;

    @Column({ type: 'enum', enum: ReportFormat })
    format: ReportFormat;

    @Column({ nullable: true })
    outputUrl: string;

    @Column({ nullable: true })
    fileName: string;

    @Column({ nullable: true })
    fileSize: number;

    @Column({ nullable: true })
    errorMessage: string;

    @Column({ nullable: true })
    startedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: true })
    scheduledReportId: string;

    @Column()
    requestedBy: string;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}
