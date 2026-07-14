import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CampaignCostsService } from './campaign-costs.service';
import { CreateCampaignCostDto } from './dto/create-campaign-cost.dto';
import { UpdateCampaignCostDto } from './dto/update-campaign-cost.dto';

@ApiTags('Custos de campanha')
@ApiBearerAuth()
@Controller('campaign-costs')
@UseGuards(JwtAuthGuard)
export class CampaignCostsController {
  constructor(private readonly campaignCostsService: CampaignCostsService) {}

  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.campaignCostsService.list(currentUser.sub);
  }

  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCampaignCostDto,
  ) {
    return this.campaignCostsService.create(currentUser.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) costId: string,
    @Body() dto: UpdateCampaignCostDto,
  ) {
    return this.campaignCostsService.update(currentUser.sub, costId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) costId: string,
  ) {
    await this.campaignCostsService.remove(currentUser.sub, costId);
  }
}
