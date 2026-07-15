import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from '../../core/users/infrastructure/database/sequelize/models/user.model';
import { AuthModule } from '../auth/auth.module';
import { CampaignLeaderModel } from '../campaign-operations/campaign-leader.model';
import { CampaignModel } from '../profile/campaign.model';
import { TeamMemberModel } from './team-member.model';
import { TeamModel } from './team.model';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([
      UserModel,
      CampaignModel,
      CampaignLeaderModel,
      TeamModel,
      TeamMemberModel,
    ]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
