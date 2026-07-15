import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('contracts')
  contracts() {
    return this.dashboardService.getContracts();
  }

  @Get('daily-summary')
  dailySummary(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.dashboardService.getDailySummary(currentUser.sub);
  }

  @Get('overview-metrics')
  overviewMetrics(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.dashboardService.getOverviewMetrics(currentUser.sub);
  }

  @Get('municipality-ranking')
  municipalityRanking(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.dashboardService.getMunicipalityRanking(currentUser.sub);
  }

  @Get('cost-ranking')
  costRanking(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('group_by') groupBy?: 'region' | 'city',
  ) {
    return this.dashboardService.getCostRanking(
      currentUser.sub,
      groupBy === 'city' ? 'city' : 'region',
    );
  }

  @Get('realtime-activities')
  realtimeActivities(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.dashboardService.getRealtimeActivities(currentUser.sub);
  }

  @Get('field-teams-now')
  fieldTeamsNow(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.dashboardService.getFieldTeamsNow(currentUser.sub);
  }
}
