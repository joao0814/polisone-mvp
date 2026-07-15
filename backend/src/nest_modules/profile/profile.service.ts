import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../../core/users/infrastructure/database/sequelize/models/user.model';
import { CampaignModel, CampaignStatus } from './campaign.model';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TeamMemberModel } from '../teams/team-member.model';
import { TeamModel } from '../teams/team.model';

type UpdateProfileInput = UpdateProfileDto & { profileImagePath?: string };

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    @InjectModel(CampaignModel)
    private readonly campaignModel: typeof CampaignModel,
    @InjectModel(TeamMemberModel)
    private readonly teamMemberModel: typeof TeamMemberModel,
  ) {}

  async get(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found');

    const campaign = await this.getCampaignForUser(userId);

    return this.toHTTP(user, campaign);
  }

  async update(userId: string, input: UpdateProfileInput) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found');

    await user.update({
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.profileImagePath
        ? { profileImagePath: input.profileImagePath }
        : {}),
    });

    const hasCampaignInput = [
      input.campaignName,
      input.candidateName,
      input.electionYear,
      input.state,
      input.intendedOffice,
    ].some((value) => value !== undefined);

    let campaign = await this.getCampaignForUser(userId);

    if (hasCampaignInput) {
      if (campaign && campaign.ownerUserId !== userId) {
        throw new BadRequestException(
          'Apenas o responsavel principal pode editar os dados da campanha.',
        );
      }

      const campaignValues = this.buildCampaignValues(input, campaign);
      if (campaign) {
        await campaign.update(campaignValues);
      } else {
        campaign = await this.campaignModel.create({
          ownerUserId: userId,
          ...campaignValues,
        });
      }
    }

    return this.toHTTP(user, campaign);
  }

  private async getCampaignForUser(userId: string) {
    const directCampaign = await this.campaignModel.findOne({
      where: { ownerUserId: userId },
    });

    if (directCampaign) {
      return directCampaign;
    }

    const member = await this.teamMemberModel.findOne({
      where: { userId },
      include: [TeamModel],
    });

    if (!member?.team?.campaignId) {
      return null;
    }

    return this.campaignModel.findByPk(member.team.campaignId);
  }

  private buildCampaignValues(
    input: UpdateProfileInput,
    current: CampaignModel | null,
  ) {
    const name = input.campaignName?.trim() || current?.name;
    const candidateName = input.candidateName?.trim() || current?.candidateName;
    const electionYear = input.electionYear
      ? Number(input.electionYear)
      : current?.electionYear;
    const state = input.state?.toUpperCase() || current?.state;
    const intendedOffice =
      input.intendedOffice?.trim() || current?.intendedOffice;

    if (!name || !candidateName || !electionYear || !state || !intendedOffice) {
      throw new BadRequestException(
        'Informe nome da campanha, candidato, eleição, UF e cargo pretendido.',
      );
    }

    if (input.startDate && input.electionDate) {
      if (new Date(input.startDate) > new Date(input.electionDate)) {
        throw new BadRequestException(
          'A data de início não pode ser posterior à data da eleição.',
        );
      }
    }

    return {
      name,
      candidateName,
      electionYear,
      state,
      intendedOffice,
      party:
        input.party !== undefined
          ? input.party.trim() || null
          : (current?.party ?? null),
      status:
        input.campaignStatus ?? current?.status ?? CampaignStatus.PRE_CAMPAIGN,
      startDate: input.startDate ?? current?.startDate ?? null,
      electionDate: input.electionDate ?? current?.electionDate ?? null,
      voteGoal:
        input.voteGoal !== undefined
          ? Number(input.voteGoal)
          : (current?.voteGoal ?? null),
    };
  }

  private toHTTP(user: UserModel, campaign: CampaignModel | null) {
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        is_active: user.isActive,
        must_change_password: user.mustChangePassword,
        profile_image_path: user.profileImagePath ?? null,
      },
      campaign: campaign
        ? {
            id: campaign.id,
            name: campaign.name,
            candidate_name: campaign.candidateName,
            election_year: campaign.electionYear,
            state: campaign.state,
            intended_office: campaign.intendedOffice,
            party: campaign.party,
            status: campaign.status,
            start_date: campaign.startDate,
            election_date: campaign.electionDate,
            vote_goal: campaign.voteGoal,
          }
        : null,
    };
  }
}
