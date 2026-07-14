import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CampaignModel } from '../profile/campaign.model';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamModel, TeamStatus } from './team.model';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(CampaignModel)
    private readonly campaignModel: typeof CampaignModel,
    @InjectModel(TeamModel)
    private readonly teamModel: typeof TeamModel,
  ) {}

  async list(userId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const teams = await this.teamModel.findAll({
      where: { campaignId: campaign.id },
      order: [
        ['createdAt', 'DESC'],
        ['name', 'ASC'],
      ],
    });

    return {
      campaign_id: campaign.id,
      items: teams.map((team) => this.toHTTP(team)),
    };
  }

  async create(userId: string, dto: CreateTeamDto) {
    const campaign = await this.getCampaignForUser(userId);
    const team = await this.teamModel.create({
      campaignId: campaign.id,
      ...this.normalizeInput(dto),
    });

    return this.toHTTP(team);
  }

  async getById(userId: string, teamId: string) {
    const team = await this.getOwnedTeam(userId, teamId);
    return this.toHTTP(team);
  }

  async update(userId: string, teamId: string, dto: UpdateTeamDto) {
    const team = await this.getOwnedTeam(userId, teamId);
    await team.update(this.normalizeInput(dto));
    return this.toHTTP(team);
  }

  async remove(userId: string, teamId: string) {
    const team = await this.getOwnedTeam(userId, teamId);
    await team.destroy();
  }

  private async getCampaignForUser(userId: string) {
    const campaign = await this.campaignModel.findOne({
      where: { ownerUserId: userId },
    });

    if (!campaign) {
      throw new BadRequestException(
        'Cadastre os dados da campanha antes de criar equipes.',
      );
    }

    return campaign;
  }

  private async getOwnedTeam(userId: string, teamId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const team = await this.teamModel.findOne({
      where: { id: teamId, campaignId: campaign.id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  private normalizeInput(dto: CreateTeamDto | UpdateTeamDto) {
    return {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.cityIbgeCode !== undefined
        ? { cityIbgeCode: dto.cityIbgeCode }
        : {}),
      ...(dto.cityName !== undefined ? { cityName: dto.cityName.trim() } : {}),
      ...(dto.state !== undefined ? { state: dto.state.toUpperCase() } : {}),
      ...(dto.coordinatorName !== undefined
        ? { coordinatorName: dto.coordinatorName.trim() || null }
        : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
    };
  }

  private toHTTP(team: TeamModel) {
    return {
      id: team.id,
      campaign_id: team.campaignId,
      name: team.name,
      city_ibge_code: team.cityIbgeCode,
      city_name: team.cityName,
      state: team.state,
      coordinator_name: team.coordinatorName,
      status: team.status ?? TeamStatus.ACTIVE,
      notes: team.notes,
      created_at: team.createdAt,
      updated_at: team.updatedAt,
    };
  }
}
