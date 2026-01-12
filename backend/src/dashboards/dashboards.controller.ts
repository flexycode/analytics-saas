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
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Dashboard } from './entities/dashboard.entity';

@ApiTags('dashboards')
@Controller('dashboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DashboardsController {
    constructor(private readonly dashboardsService: DashboardsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new dashboard' })
    @ApiResponse({ status: 201, description: 'Dashboard created' })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateDashboardDto,
    ): Promise<Dashboard> {
        return this.dashboardsService.create(user.tenantId!, user.sub, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all dashboards for user' })
    @ApiResponse({ status: 200, description: 'List of dashboards' })
    async findAll(@CurrentUser() user: JwtPayload): Promise<Dashboard[]> {
        return this.dashboardsService.findAll(user.tenantId!, user.sub);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get dashboard by ID' })
    @ApiResponse({ status: 200, description: 'Dashboard details' })
    async findOne(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<Dashboard> {
        return this.dashboardsService.findOne(id, user.tenantId!, user.sub);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update dashboard' })
    @ApiResponse({ status: 200, description: 'Dashboard updated' })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateDashboardDto,
    ): Promise<Dashboard> {
        return this.dashboardsService.update(id, user.tenantId!, user.sub, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete dashboard' })
    @ApiResponse({ status: 200, description: 'Dashboard deleted' })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<{ message: string }> {
        await this.dashboardsService.remove(id, user.tenantId!, user.sub);
        return { message: 'Dashboard deleted successfully' };
    }
}
