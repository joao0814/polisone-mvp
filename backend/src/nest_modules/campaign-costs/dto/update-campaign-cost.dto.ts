import { PartialType } from '@nestjs/swagger';
import { CreateCampaignCostDto } from './create-campaign-cost.dto';

export class UpdateCampaignCostDto extends PartialType(CreateCampaignCostDto) {}
