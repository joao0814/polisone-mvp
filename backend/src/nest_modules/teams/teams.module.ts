import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { CampaignModel } from '../profile/campaign.model';
import { TeamMemberModel } from './team-member.model';
import { TeamModel } from './team.model';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([CampaignModel, TeamModel, TeamMemberModel]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
