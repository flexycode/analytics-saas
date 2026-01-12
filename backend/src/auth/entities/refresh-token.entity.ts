import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
@Index(['userId', 'isRevoked'])
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    token: string;

    @Column('uuid')
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ default: false })
    isRevoked: boolean;

    @Column('timestamp with time zone')
    expiresAt: Date;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}
