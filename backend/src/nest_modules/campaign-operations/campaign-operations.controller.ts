import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CampaignOperationsService } from './campaign-operations.service';
import { CreateCampaignCheckInDto } from './dto/create-campaign-check-in.dto';
import { CreateCampaignLeaderDto } from './dto/create-campaign-leader.dto';
import { CreateFieldActivityDto } from './dto/create-field-activity.dto';

@ApiTags('Operacoes de campanha')
@ApiBearerAuth()
@Controller('campaign-operations')
@UseGuards(JwtAuthGuard)
export class CampaignOperationsController {
  constructor(
    private readonly campaignOperationsService: CampaignOperationsService,
  ) {}

  @Get('check-ins')
  listCheckIns(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.campaignOperationsService.listCheckIns(currentUser.sub);
  }

  @Post('check-ins')
  createCheckIn(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCampaignCheckInDto,
  ) {
    return this.campaignOperationsService.createCheckIn(currentUser.sub, dto);
  }

  @Get('activities')
  listActivities(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.campaignOperationsService.listActivities(currentUser.sub);
  }

  @Post('activities')
  createActivity(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateFieldActivityDto,
  ) {
    return this.campaignOperationsService.createActivity(currentUser.sub, dto);
  }

  @Get('leaders')
  listLeaders(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.campaignOperationsService.listLeaders(currentUser.sub);
  }

  @Post('leaders')
  createLeader(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCampaignLeaderDto,
  ) {
    return this.campaignOperationsService.createLeader(currentUser.sub, dto);
  }
}
