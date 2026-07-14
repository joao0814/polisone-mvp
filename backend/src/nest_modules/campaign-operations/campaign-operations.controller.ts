import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CampaignOperationsService } from './campaign-operations.service';
import { CheckoutCampaignCheckInDto } from './dto/checkout-campaign-check-in.dto';
import { CreateCampaignCheckInDto } from './dto/create-campaign-check-in.dto';
import { CreateCampaignLeaderDto } from './dto/create-campaign-leader.dto';
import { CreateFieldActivityDto } from './dto/create-field-activity.dto';
import { ListCampaignCheckInsDto } from './dto/list-campaign-check-ins.dto';
import { UpdateCampaignCheckInDto } from './dto/update-campaign-check-in.dto';

@ApiTags('Operacoes de campanha')
@ApiBearerAuth()
@Controller('campaign-operations')
@UseGuards(JwtAuthGuard)
export class CampaignOperationsController {
  constructor(
    private readonly campaignOperationsService: CampaignOperationsService,
  ) {}

  @Get('check-ins')
  listCheckIns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListCampaignCheckInsDto,
  ) {
    return this.campaignOperationsService.listCheckIns(currentUser.sub, query);
  }

  @Post('check-ins')
  createCheckIn(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCampaignCheckInDto,
  ) {
    return this.campaignOperationsService.createCheckIn(currentUser.sub, dto);
  }

  @Get('check-ins/:id')
  getCheckInById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) checkInId: string,
  ) {
    return this.campaignOperationsService.getCheckInById(
      currentUser.sub,
      checkInId,
    );
  }

  @Patch('check-ins/:id')
  updateCheckIn(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) checkInId: string,
    @Body() dto: UpdateCampaignCheckInDto,
  ) {
    return this.campaignOperationsService.updateCheckIn(
      currentUser.sub,
      checkInId,
      dto,
    );
  }

  @Patch('check-ins/:id/checkout')
  checkoutCheckIn(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) checkInId: string,
    @Body() dto: CheckoutCampaignCheckInDto,
  ) {
    return this.campaignOperationsService.checkoutCheckIn(
      currentUser.sub,
      checkInId,
      dto,
    );
  }

  @Patch('check-ins/:id/cancel')
  cancelCheckIn(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) checkInId: string,
  ) {
    return this.campaignOperationsService.cancelCheckIn(
      currentUser.sub,
      checkInId,
    );
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
