import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { CampaignModel } from '../profile/campaign.model';
import { TeamMemberModel } from '../teams/team-member.model';
import { TeamModel } from '../teams/team.model';
import { CampaignCheckInModel } from './campaign-check-in.model';
import { CampaignLeaderModel } from './campaign-leader.model';
import { CampaignOperationsController } from './campaign-operations.controller';
import { CampaignOperationsService } from './campaign-operations.service';
import { FieldActivityModel } from './field-activity.model';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([
      CampaignModel,
      TeamModel,
      TeamMemberModel,
      CampaignCheckInModel,
      FieldActivityModel,
      CampaignLeaderModel,
    ]),
  ],
  controllers: [CampaignOperationsController],
  providers: [CampaignOperationsService],
  exports: [CampaignOperationsService],
})
export class CampaignOperationsModule {}
