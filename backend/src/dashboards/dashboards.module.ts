import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { Dashboard } from './entities/dashboard.entity';
import { Widget } from './entities/widget.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Dashboard, Widget])],
    controllers: [DashboardsController],
    providers: [DashboardsService],
    exports: [DashboardsService],
})
export class DashboardsModule { }
