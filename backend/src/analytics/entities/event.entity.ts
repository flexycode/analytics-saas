import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('events')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'eventType'])
@Index(['sessionId'])
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    eventType: string;

    @Column({ nullable: true })
    eventName: string;

    @Column({ type: 'jsonb', nullable: true })
    properties: Record<string, any>;

    @Column({ nullable: true })
    userId: string;

    @Column({ nullable: true })
    sessionId: string;

    @Column({ nullable: true })
    pageUrl: string;

    @Column({ nullable: true })
    referrer: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ type: 'jsonb', nullable: true })
    deviceInfo: {
        browser?: string;
        os?: string;
        device?: string;
        isMobile?: boolean;
    };

    @Column({ type: 'jsonb', nullable: true })
    geoInfo: {
        country?: string;
        region?: string;
        city?: string;
        timezone?: string;
    };

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}
