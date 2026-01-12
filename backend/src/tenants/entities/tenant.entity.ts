import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SubscriptionTier {
    FREE = 'free',
    STARTER = 'starter',
    PROFESSIONAL = 'professional',
    ENTERPRISE = 'enterprise',
}

@Entity('tenants')
@Index(['subdomain'], { unique: true })
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    subdomain: string;

    @Column({ nullable: true })
    domain: string;

    @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.FREE })
    subscriptionTier: SubscriptionTier;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    settings: {
        theme?: string;
        logo?: string;
        timezone?: string;
        dateFormat?: string;
        features?: string[];
    };

    @Column({ type: 'jsonb', nullable: true })
    limits: {
        maxUsers?: number;
        maxDashboards?: number;
        maxReports?: number;
        dataRetentionDays?: number;
        apiRateLimit?: number;
    };

    @OneToMany(() => User, (user) => user.tenant)
    users: User[];

    @Column({ nullable: true })
    billingEmail: string;

    @Column({ nullable: true })
    stripeCustomerId: string;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}
