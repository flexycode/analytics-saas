import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../tenants.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly tenantsService: TenantsService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        // Get tenant from header or subdomain
        let tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            // Try to extract from subdomain
            const host = req.headers.host || '';
            const subdomain = host.split('.')[0];

            if (subdomain && subdomain !== 'api' && subdomain !== 'www') {
                const tenant = await this.tenantsService.findBySubdomain(subdomain);
                if (tenant) {
                    tenantId = tenant.id;
                }
            }
        }

        // Attach tenant to request
        (req as any).tenantId = tenantId;

        next();
    }
}
