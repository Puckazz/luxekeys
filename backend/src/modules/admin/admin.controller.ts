import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/index.js';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/index.js';
import { UserRole } from '../../generated/prisma/index.js';
import { AdminService } from './admin.service.js';
import {
  AdminStatsPeriodQueryDto,
  AdminTopProductsQueryDto,
} from './dto/admin-stats-query.dto.js';

@ApiTags('Admin Dashboard')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get admin dashboard KPI overview' })
  @ApiOkResponse({ description: 'Dashboard KPI overview' })
  getOverview(@Query() query: AdminStatsPeriodQueryDto) {
    return this.adminService.getOverview(query.period);
  }

  @Get('stats/revenue')
  @ApiOperation({ summary: 'Get admin dashboard revenue trend' })
  @ApiOkResponse({ description: 'Dashboard revenue trend' })
  getRevenue(@Query() query: AdminStatsPeriodQueryDto) {
    return this.adminService.getRevenue(query.period);
  }

  @Get('stats/top-products')
  @ApiOperation({ summary: 'Get admin dashboard top selling products' })
  @ApiOkResponse({ description: 'Top selling products' })
  getTopProducts(@Query() query: AdminTopProductsQueryDto) {
    return this.adminService.getTopProducts(query.period, query.limit);
  }
}
