import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CampaignModel } from '../profile/campaign.model';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMemberModel, TeamMemberStatus } from './team-member.model';
import { TeamModel, TeamStatus } from './team.model';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(CampaignModel)
    private readonly campaignModel: typeof CampaignModel,
    @InjectModel(TeamModel)
    private readonly teamModel: typeof TeamModel,
    @InjectModel(TeamMemberModel)
    private readonly teamMemberModel: typeof TeamMemberModel,
  ) {}

  async list(userId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const teams = await this.teamModel.findAll({
      where: { campaignId: campaign.id },
      include: [TeamMemberModel],
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
    const team = await this.getOwnedTeam(userId, teamId, true);
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

  async listMembers(userId: string, teamId: string) {
    const team = await this.getOwnedTeam(userId, teamId);
    const members = await this.teamMemberModel.findAll({
      where: { teamId: team.id },
      order: [
        ['createdAt', 'DESC'],
        ['name', 'ASC'],
      ],
    });

    return {
      team_id: team.id,
      items: members.map((member) => this.memberToHTTP(member)),
    };
  }

  async createMember(userId: string, teamId: string, dto: CreateTeamMemberDto) {
    const team = await this.getOwnedTeam(userId, teamId);
    const member = await this.teamMemberModel.create({
      teamId: team.id,
      ...this.normalizeMemberInput(dto),
    });

    return this.memberToHTTP(member);
  }

  async updateMember(
    userId: string,
    teamId: string,
    memberId: string,
    dto: UpdateTeamMemberDto,
  ) {
    const member = await this.getOwnedMember(userId, teamId, memberId);
    await member.update(this.normalizeMemberInput(dto));
    return this.memberToHTTP(member);
  }

  async removeMember(userId: string, teamId: string, memberId: string) {
    const member = await this.getOwnedMember(userId, teamId, memberId);
    await member.destroy();
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

  private async getOwnedTeam(userId: string, teamId: string, withMembers = false) {
    const campaign = await this.getCampaignForUser(userId);
    const team = await this.teamModel.findOne({
      ...(withMembers ? { include: [TeamMemberModel] } : {}),
      where: { id: teamId, campaignId: campaign.id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  private async getOwnedMember(
    userId: string,
    teamId: string,
    memberId: string,
  ) {
    const team = await this.getOwnedTeam(userId, teamId);
    const member = await this.teamMemberModel.findOne({
      where: { id: memberId, teamId: team.id },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return member;
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

  private normalizeMemberInput(dto: CreateTeamMemberDto | UpdateTeamMemberDto) {
    return {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
      ...(dto.role !== undefined ? { role: dto.role.trim() } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.cityIbgeCode !== undefined
        ? { cityIbgeCode: dto.cityIbgeCode || null }
        : {}),
    };
  }

  private toHTTP(team: TeamModel) {
    const members = team.members ?? [];

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
      members_count: members.length,
      members: members.length ? members.map((member) => this.memberToHTTP(member)) : undefined,
      created_at: team.createdAt,
      updated_at: team.updatedAt,
    };
  }

  private memberToHTTP(member: TeamMemberModel) {
    return {
      id: member.id,
      team_id: member.teamId,
      name: member.name,
      phone: member.phone,
      role: member.role,
      status: member.status ?? TeamMemberStatus.ACTIVE,
      city_ibge_code: member.cityIbgeCode,
      created_at: member.createdAt,
      updated_at: member.updatedAt,
    };
  }
}
