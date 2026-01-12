import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { Widget } from './widget.entity';

@Entity('dashboards')
@Index(['tenantId', 'createdBy'])
export class Dashboard {
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

    @Column({ default: false })
    isDefault: boolean;

    @Column({ default: false })
    isShared: boolean;

    @Column({ type: 'jsonb', nullable: true })
    layout: {
        columns?: number;
        rows?: number;
        gridGap?: number;
        widgets?: Array<{
            widgetId: string;
            x: number;
            y: number;
            w: number;
            h: number;
        }>;
    };

    @Column({ type: 'jsonb', nullable: true })
    filters: {
        dateRange?: { start: string; end: string };
        customFilters?: Record<string, any>;
    };

    @OneToMany(() => Widget, (widget) => widget.dashboard, { cascade: true })
    widgets: Widget[];

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}
