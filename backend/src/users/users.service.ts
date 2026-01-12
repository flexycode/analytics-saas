import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findAll(tenantId?: string): Promise<User[]> {
        const query = this.userRepository.createQueryBuilder('user');

        if (tenantId) {
            query.where('user.tenantId = :tenantId', { tenantId });
        }

        return query.orderBy('user.createdAt', 'DESC').getMany();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
        }

        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }

    async updateLastLogin(id: string): Promise<void> {
        await this.userRepository.update(id, { lastLoginAt: new Date() });
    }

    async countByTenant(tenantId: string): Promise<number> {
        return this.userRepository.count({ where: { tenantId } });
    }
}
