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
import { Dashboard } from './dashboard.entity';

export enum WidgetType {
    LINE_CHART = 'line_chart',
    BAR_CHART = 'bar_chart',
    PIE_CHART = 'pie_chart',
    AREA_CHART = 'area_chart',
    METRIC_CARD = 'metric_card',
    TABLE = 'table',
    HEATMAP = 'heatmap',
    FUNNEL = 'funnel',
    MAP = 'map',
    TEXT = 'text',
}

@Entity('widgets')
@Index(['dashboardId'])
export class Widget {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    dashboardId: string;

    @ManyToOne(() => Dashboard, (dashboard) => dashboard.widgets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'dashboardId' })
    dashboard: Dashboard;

    @Column()
    title: string;

    @Column({ type: 'enum', enum: WidgetType })
    type: WidgetType;

    @Column({ type: 'jsonb' })
    config: {
        dataSource?: {
            type: 'events' | 'metrics' | 'custom';
            query?: string;
            metricNames?: string[];
            eventType?: string;
            aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
            groupBy?: string[];
        };
        visualization?: {
            colors?: string[];
            showLegend?: boolean;
            showGrid?: boolean;
            xAxis?: { label?: string; format?: string };
            yAxis?: { label?: string; format?: string };
        };
        refreshInterval?: number; // seconds
    };

    @Column({ type: 'jsonb', nullable: true })
    style: {
        backgroundColor?: string;
        borderRadius?: number;
        padding?: number;
    };

    @Column({ default: 0 })
    order: number;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}
