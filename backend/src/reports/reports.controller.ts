import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post('templates')
    @ApiOperation({ summary: 'Create a report template' })
    @ApiResponse({ status: 201, description: 'Template created' })
    async createTemplate(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateReportTemplateDto,
    ) {
        return this.reportsService.createTemplate(user.tenantId!, user.sub, dto);
    }

    @Get('templates')
    @ApiOperation({ summary: 'Get all report templates' })
    @ApiResponse({ status: 200, description: 'List of templates' })
    async findAllTemplates(@CurrentUser() user: JwtPayload) {
        return this.reportsService.findAllTemplates(user.tenantId!);
    }

    @Get('templates/:id')
    @ApiOperation({ summary: 'Get report template by ID' })
    @ApiResponse({ status: 200, description: 'Template details' })
    async findTemplate(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.reportsService.findTemplate(id, user.tenantId!);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate a report from template' })
    @ApiResponse({ status: 201, description: 'Report generation started' })
    async generateReport(
        @CurrentUser() user: JwtPayload,
        @Body() dto: GenerateReportDto,
    ) {
        return this.reportsService.generateReport(
            user.tenantId!,
            user.sub,
            dto.templateId,
            dto.format,
        );
    }

    @Get('runs/:id')
    @ApiOperation({ summary: 'Get report run status' })
    @ApiResponse({ status: 200, description: 'Run status' })
    async getRunStatus(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.reportsService.getRunStatus(id, user.tenantId!);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get report run history' })
    @ApiResponse({ status: 200, description: 'Run history' })
    async getHistory(
        @CurrentUser() user: JwtPayload,
        @Query('limit') limit: number = 20,
    ) {
        return this.reportsService.getRunHistory(user.tenantId!, limit);
    }
}
