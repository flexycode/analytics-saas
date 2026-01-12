export interface JwtPayload {
    sub: string;       // User ID
    email: string;     // User email
    role: string;      // User role (admin, user, etc.)
    tenantId?: string; // Tenant ID for multi-tenancy
    iat?: number;      // Issued at
    exp?: number;      // Expiration
}
