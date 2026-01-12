import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum ReportFormat {
    PDF = 'pdf',
    EXCEL = 'excel',
    CSV = 'csv',
    JSON = 'json',
}

@Entity('report_templates')
@Index(['tenantId', 'createdBy'])
export class ReportTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    createdBy: string;

    @Column({ type: 'jsonb' })
    config: {
        title: string;
        sections: Array<{
            type: 'summary' | 'chart' | 'table' | 'text';
            title?: string;
            dataSource?: {
                type: 'events' | 'metrics' | 'dashboard';
                query?: string;
                dashboardId?: string;
            };
            options?: Record<string, any>;
        }>;
        dateRange?: {
            type: 'relative' | 'absolute';
            relative?: string; // 'last_7_days', 'last_30_days', etc.
            start?: string;
            end?: string;
        };
        filters?: Record<string, any>;
    };

    @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.PDF })
    defaultFormat: ReportFormat;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}
