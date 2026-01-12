import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

export enum MetricGranularity {
    MINUTE = 'minute',
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
}

@Entity('metrics')
@Index(['tenantId', 'metricName', 'periodStart'])
@Index(['tenantId', 'granularity', 'periodStart'])
export class Metric {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    metricName: string;

    @Column({ type: 'decimal', precision: 20, scale: 4 })
    value: number;

    @Column({ type: 'enum', enum: MetricGranularity, default: MetricGranularity.HOUR })
    granularity: MetricGranularity;

    @Column({ type: 'timestamp with time zone' })
    periodStart: Date;

    @Column({ type: 'timestamp with time zone' })
    periodEnd: Date;

    @Column({ type: 'jsonb', nullable: true })
    dimensions: Record<string, string>;

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        count?: number;
        sum?: number;
        avg?: number;
        min?: number;
        max?: number;
    };

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}
