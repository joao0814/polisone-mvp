import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CalendarEventModel } from '../../core/calendar-events/infrastructure/database/sequelize/models/calendar-event.model';
import { CampaignCheckInModel } from '../campaign-operations/campaign-check-in.model';
import { AuthModule } from '../auth/auth.module';
import { CampaignLeaderModel } from '../campaign-operations/campaign-leader.model';
import { FieldActivityModel } from '../campaign-operations/field-activity.model';
import { CampaignCostModel } from '../campaign-costs/campaign-cost.model';
import { CampaignModel } from '../profile/campaign.model';
import { TeamMemberModel } from '../teams/team-member.model';
import { TeamModel } from '../teams/team.model';
import { TeamsModule } from '../teams/teams.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    AuthModule,
    TeamsModule,
    SequelizeModule.forFeature([
      TeamModel,
      TeamMemberModel,
      CampaignCheckInModel,
      FieldActivityModel,
      CampaignLeaderModel,
      CampaignCostModel,
      CampaignModel,
      CalendarEventModel,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
