import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { Tenant } from './entities/tenant.entity';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new tenant (super admin only)' })
    @ApiResponse({ status: 201, description: 'Tenant created' })
    async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
        return this.tenantsService.create(createTenantDto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all tenants (super admin only)' })
    @ApiResponse({ status: 200, description: 'List of tenants' })
    async findAll(): Promise<Tenant[]> {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get tenant by ID' })
    @ApiResponse({ status: 200, description: 'Tenant details' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Tenant> {
        return this.tenantsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update tenant (super admin only)' })
    @ApiResponse({ status: 200, description: 'Tenant updated' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTenantDto: UpdateTenantDto,
    ): Promise<Tenant> {
        return this.tenantsService.update(id, updateTenantDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete tenant (super admin only)' })
    @ApiResponse({ status: 200, description: 'Tenant deleted' })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        await this.tenantsService.remove(id);
        return { message: 'Tenant deleted successfully' };
    }
}
