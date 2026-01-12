import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { ReportTemplate, ReportFormat } from './report-template.entity';

@Entity('scheduled_reports')
@Index(['tenantId', 'isActive'])
export class ScheduledReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    templateId: string;

    @ManyToOne(() => ReportTemplate, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'templateId' })
    template: ReportTemplate;

    @Column()
    name: string;

    @Column()
    cronExpression: string; // e.g., '0 9 * * 1' for every Monday at 9am

    @Column({ nullable: true })
    timezone: string;

    @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.PDF })
    format: ReportFormat;

    @Column({ type: 'simple-array' })
    recipients: string[]; // email addresses

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    lastRunAt: Date;

    @Column({ nullable: true })
    nextRunAt: Date;

    @Column()
    createdBy: string;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}
