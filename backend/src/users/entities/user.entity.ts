import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['tenantId'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    @Exclude()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
    role: UserRole;

    @Column({ nullable: true })
    tenantId: string;

    @ManyToOne(() => Tenant, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ type: 'jsonb', nullable: true })
    preferences: Record<string, any>;

    @Column({ nullable: true })
    lastLoginAt: Date;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    // Virtual property
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
