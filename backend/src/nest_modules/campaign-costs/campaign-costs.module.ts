import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { CampaignModel } from '../profile/campaign.model';
import { TeamMemberModel } from '../teams/team-member.model';
import { TeamModel } from '../teams/team.model';
import { CampaignCostModel } from './campaign-cost.model';
import { CampaignCostsController } from './campaign-costs.controller';
import { CampaignCostsService } from './campaign-costs.service';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([
      CampaignModel,
      TeamModel,
      TeamMemberModel,
      CampaignCostModel,
    ]),
  ],
  controllers: [CampaignCostsController],
  providers: [CampaignCostsService],
  exports: [CampaignCostsService],
})
export class CampaignCostsModule {}
