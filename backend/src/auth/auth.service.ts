import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokensDto } from './dto/tokens.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<TokensDto> {
        const { email, password, firstName, lastName } = registerDto;

        // Check if user exists
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        await this.userRepository.save(user);
        this.logger.log(`User registered: ${email}`);

        return this.generateTokens(user);
    }

    async login(loginDto: LoginDto): Promise<TokensDto> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'tenantId'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`User logged in: ${email}`);
        return this.generateTokens(user);
    }

    async refreshTokens(refreshToken: string): Promise<TokensDto> {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Find stored refresh token
            const storedToken = await this.refreshTokenRepository.findOne({
                where: { token: refreshToken, userId: payload.sub },
            });

            if (!storedToken || storedToken.isRevoked) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Find user
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Revoke old refresh token
            await this.refreshTokenRepository.update(storedToken.id, { isRevoked: true });

            return this.generateTokens(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            { userId, isRevoked: false },
            { isRevoked: true },
        );
        this.logger.log(`User logged out: ${userId}`);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'tenantId'],
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }

    private async generateTokens(user: User): Promise<TokensDto> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);

        // Store refresh token
        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            accessToken,
            refreshToken,
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        };
    }
}
