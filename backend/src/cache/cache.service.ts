import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get<T>(key: string): Promise<T | undefined> {
        try {
            return await this.cacheManager.get<T>(key);
        } catch (error) {
            this.logger.error(`Cache get error for key ${key}:`, error);
            return undefined;
        }
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            await this.cacheManager.set(key, value, ttl);
        } catch (error) {
            this.logger.error(`Cache set error for key ${key}:`, error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.cacheManager.del(key);
        } catch (error) {
            this.logger.error(`Cache delete error for key ${key}:`, error);
        }
    }

    async reset(): Promise<void> {
        // Note: cache-manager v5 doesn't support reset() 
        this.logger.warn('Cache reset called - use Redis FLUSHDB in production');
    }

    // Tenant-scoped cache keys
    tenantKey(tenantId: string, key: string): string {
        return `tenant:${tenantId}:${key}`;
    }

    // User-scoped cache keys
    userKey(userId: string, key: string): string {
        return `user:${userId}:${key}`;
    }

    // Generic wrapper for caching function results
    async wrap<T>(
        key: string,
        fn: () => Promise<T>,
        ttl?: number,
    ): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== undefined) {
            return cached;
        }

        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }
}
