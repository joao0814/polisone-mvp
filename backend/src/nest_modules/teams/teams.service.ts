import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../../core/users/infrastructure/database/sequelize/models/user.model';
import { UserRole } from '../../core/users/domain/enums/user-role.enum';
import { PasswordHasher } from '../../shared/security/password-hasher';
import { CampaignLeaderModel } from '../campaign-operations/campaign-leader.model';
import { CampaignModel } from '../profile/campaign.model';
import { campaignRegions, matchesRegion } from './campaign-regions';
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
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(CampaignLeaderModel)
    private readonly campaignLeaderModel: typeof CampaignLeaderModel,
    @InjectModel(TeamModel)
    private readonly teamModel: typeof TeamModel,
    @InjectModel(TeamMemberModel)
    private readonly teamMemberModel: typeof TeamMemberModel,
    private readonly passwordHasher: PasswordHasher,
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
    const leaderMap = await this.getLeaderMapForCampaign(campaign.id);

    return {
      campaign_id: campaign.id,
      items: teams.map((team) => this.toHTTP(team, leaderMap.get(team.id) ?? null)),
    };
  }

  async create(userId: string, dto: CreateTeamDto) {
    const campaign = await this.getCampaignForUser(userId);
    const team = await this.teamModel.create({
      campaignId: campaign.id,
      ...this.normalizeInput(dto),
    });
    const leader = await this.syncTeamLeaderLink(
      campaign.id,
      team.id,
      this.resolveLinkedLeaderId(dto),
    );

    return this.toHTTP(team, leader);
  }

  async getById(userId: string, teamId: string) {
    const team = await this.getOwnedTeam(userId, teamId, true);
    const leader = await this.campaignLeaderModel.findOne({
      where: { teamId: team.id },
    });
    return this.toHTTP(team, leader);
  }

  async update(userId: string, teamId: string, dto: UpdateTeamDto) {
    const campaign = await this.getCampaignForUser(userId);
    const team = await this.getOwnedTeam(userId, teamId);
    await team.update(this.normalizeInput(dto));
    const leader = await this.syncTeamLeaderLink(
      campaign.id,
      team.id,
      this.resolveLinkedLeaderId(dto),
      !this.hasLinkedLeaderInput(dto),
    );
    return this.toHTTP(team, leader);
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
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.userModel.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException(
        'Ja existe um usuario cadastrado com este e-mail.',
      );
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await this.passwordHasher.hash(temporaryPassword);
    const user = await this.userModel.create({
      name: dto.name.trim(),
      email,
      passwordHash,
      roles: [UserRole.USER],
      isActive: true,
      mustChangePassword: true,
    });

    const member = await this.teamMemberModel.create({
      teamId: team.id,
      ...this.normalizeMemberInput(dto),
      email,
      userId: user.id,
    });

    return {
      ...this.memberToHTTP(member),
      access_invite: {
        email,
        temporary_password: temporaryPassword,
        must_change_password: true,
      },
    };
  }

  async updateMember(
    userId: string,
    teamId: string,
    memberId: string,
    dto: UpdateTeamMemberDto,
  ) {
    const member = await this.getOwnedMember(userId, teamId, memberId);
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (existingUser && existingUser.id !== member.userId) {
        throw new BadRequestException(
          'Ja existe um usuario cadastrado com este e-mail.',
        );
      }

      if (member.userId) {
        const user = await this.userModel.findByPk(member.userId);
        if (user) {
          await user.update({
            email,
            ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          });
        }
      }
    }

    if (member.userId && (dto.status !== undefined || dto.name !== undefined)) {
      const user = await this.userModel.findByPk(member.userId);
      if (user) {
        await user.update({
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.status !== undefined
            ? { isActive: dto.status === TeamMemberStatus.ACTIVE }
            : {}),
        });
      }
    }

    await member.update(this.normalizeMemberInput(dto));
    return this.memberToHTTP(member);
  }

  async removeMember(userId: string, teamId: string, memberId: string) {
    const member = await this.getOwnedMember(userId, teamId, memberId);
    if (member.userId) {
      const user = await this.userModel.findByPk(member.userId);
      if (user) {
        await user.update({ isActive: false });
      }
    }
    await member.destroy();
  }

  async getSummary(userId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const teams = await this.getTeamsWithMembers(userId);
    const activeTeams = teams.filter((team) => team.status === TeamStatus.ACTIVE);
    const totalMembers = teams.reduce(
      (accumulator, team) => accumulator + (team.members?.length ?? 0),
      0,
    );
    const activeMembers = teams.reduce(
      (accumulator, team) =>
        accumulator +
        (team.members?.filter((member) => member.status === TeamMemberStatus.ACTIVE)
          .length ?? 0),
      0,
    );
    const cityMap = this.buildCityMap(teams);
    const ranking = [...cityMap.values()]
      .sort(
        (left, right) =>
          right.members_count - left.members_count ||
          right.team_count - left.team_count ||
          left.city_name.localeCompare(right.city_name),
      )
      .slice(0, 5)
      .map((city) => ({
        name: city.city_name,
        value: city.members_count || city.team_count,
      }));
    const fieldTeams = activeTeams
      .sort(
        (left, right) =>
          (right.members?.length ?? 0) - (left.members?.length ?? 0) ||
          left.name.localeCompare(right.name),
      )
      .slice(0, 4)
      .map((team) => ({
        id: team.id,
        name: team.name,
        city: team.cityName,
        activities: team.members?.length ?? 0,
        people: (team.members ?? []).slice(0, 3).map((member) => member.name),
      }));

    return {
      totals: {
        active_members: activeMembers,
        active_teams: activeTeams.length,
        total_members: totalMembers,
        total_teams: teams.length,
        total_cities: cityMap.size,
      },
      metrics: {
        municipalities_active: cityMap.size,
        leaders: await this.campaignLeaderModel.count({
          where: { campaignId: campaign.id },
        }),
        representatives: totalMembers,
      },
      municipality_ranking: ranking,
      field_teams: fieldTeams,
    };
  }

  async getMap(userId: string) {
    const teams = await this.getTeamsWithMembers(userId);
    const cityMap = this.buildCityMap(teams);
    const regionSummaries = campaignRegions.map((region) => {
      const matchingCities = [...cityMap.values()].filter((city) =>
        matchesRegion(region, city.city_ibge_code),
      );
      const teamCount = matchingCities.reduce(
        (accumulator, city) => accumulator + city.team_count,
        0,
      );
      const membersCount = matchingCities.reduce(
        (accumulator, city) => accumulator + city.members_count,
        0,
      );

      return {
        id: region.id,
        label: region.label,
        team_count: teamCount,
        members_count: membersCount,
        value: teamCount > 0 ? this.getRegionValue(teamCount, teams.length) : 0,
      };
    });

    return {
      municipalities: [...cityMap.values()].map((city) => ({
        ...city,
        tone: this.getToneForTeamCount(city.team_count),
      })),
      regions: regionSummaries,
    };
  }

  private async getCampaignForUser(userId: string) {
    const campaign =
      (await this.campaignModel.findOne({
        where: { ownerUserId: userId },
      })) ??
      (await this.resolveCampaignByTeamMember(userId));

    if (!campaign) {
      throw new BadRequestException(
        'Cadastre os dados da campanha antes de criar equipes.',
      );
    }

    return campaign;
  }

  private async resolveCampaignByTeamMember(userId: string) {
    const teamMember = await this.teamMemberModel.findOne({
      where: { userId },
      include: [TeamModel],
    });

    if (!teamMember?.teamId) {
      return null;
    }

    const campaignId = teamMember.team?.campaignId;
    return campaignId ? this.campaignModel.findByPk(campaignId) : null;
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

  private async getTeamsWithMembers(userId: string) {
    const campaign = await this.getCampaignForUser(userId);

    return this.teamModel.findAll({
      where: { campaignId: campaign.id },
      include: [TeamMemberModel],
      order: [
        ['createdAt', 'DESC'],
        ['name', 'ASC'],
      ],
    });
  }

  private buildCityMap(teams: TeamModel[]) {
    return teams.reduce<Map<string, {
      city_ibge_code: string;
      city_name: string;
      state: string;
      team_count: number;
      active_team_count: number;
      members_count: number;
    }>>((accumulator, team) => {
      const current = accumulator.get(team.cityIbgeCode) ?? {
        city_ibge_code: team.cityIbgeCode,
        city_name: team.cityName,
        state: team.state,
        team_count: 0,
        active_team_count: 0,
        members_count: 0,
      };

      current.team_count += 1;
      current.active_team_count += team.status === TeamStatus.ACTIVE ? 1 : 0;
      current.members_count += team.members?.length ?? 0;
      accumulator.set(team.cityIbgeCode, current);
      return accumulator;
    }, new Map());
  }

  private getToneForTeamCount(teamCount: number) {
    if (teamCount <= 0) return 'empty';
    if (teamCount === 1) return 'low';
    if (teamCount === 2) return 'medium';
    if (teamCount <= 4) return 'good';
    return 'high';
  }

  private getRegionValue(teamCount: number, totalTeams: number) {
    if (!totalTeams) return 0;
    return Math.max(8, Math.min(100, Math.round((teamCount / totalTeams) * 100)));
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
      ...(dto.plannedHeadcount !== undefined
        ? { plannedHeadcount: Number(dto.plannedHeadcount) }
        : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
    };
  }

  private normalizeMemberInput(dto: CreateTeamMemberDto | UpdateTeamMemberDto) {
    return {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
      ...(dto.email !== undefined
        ? { email: dto.email.trim().toLowerCase() || null }
        : {}),
      ...(dto.role !== undefined ? { role: dto.role.trim() } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.cityIbgeCode !== undefined
        ? { cityIbgeCode: dto.cityIbgeCode || null }
        : {}),
    };
  }

  private async getLeaderMapForCampaign(campaignId: string) {
    const leaders = await this.campaignLeaderModel.findAll({
      where: { campaignId },
      order: [['createdAt', 'DESC']],
    });

    return leaders.reduce<Map<string, CampaignLeaderModel>>((accumulator, leader) => {
      if (leader.teamId && !accumulator.has(leader.teamId)) {
        accumulator.set(leader.teamId, leader);
      }

      return accumulator;
    }, new Map());
  }

  private async syncTeamLeaderLink(
    campaignId: string,
    teamId: string,
    leaderId: string | null | undefined,
    preserveCurrent = false,
  ) {
    if (preserveCurrent) {
      return this.campaignLeaderModel.findOne({
        where: { campaignId, teamId },
      });
    }

    const currentLinks = await this.campaignLeaderModel.findAll({
      where: { campaignId, teamId },
    });

    if (!leaderId) {
      await Promise.all(
        currentLinks.map((leader) => leader.update({ teamId: null })),
      );
      return null;
    }

    const leader = await this.campaignLeaderModel.findOne({
      where: { campaignId, id: leaderId },
    });

    if (!leader) {
      throw new BadRequestException(
        'A lideranca vinculada nao pertence a campanha atual.',
      );
    }

    await Promise.all(
      currentLinks
        .filter((item) => item.id !== leader.id)
        .map((item) => item.update({ teamId: null })),
    );

    if (leader.teamId !== teamId) {
      await leader.update({ teamId });
    }

    return leader;
  }

  private hasLinkedLeaderInput(dto: CreateTeamDto | UpdateTeamDto) {
    return Object.prototype.hasOwnProperty.call(dto, 'linkedLeaderId');
  }

  private resolveLinkedLeaderId(dto: CreateTeamDto | UpdateTeamDto) {
    if (!this.hasLinkedLeaderInput(dto)) {
      return undefined;
    }

    return dto.linkedLeaderId || null;
  }

  private toHTTP(team: TeamModel, leader: CampaignLeaderModel | null) {
    const members = team.members ?? [];
    const activeMembersCount = members.filter(
      (member) => member.status === TeamMemberStatus.ACTIVE,
    ).length;

    return {
      id: team.id,
      campaign_id: team.campaignId,
      name: team.name,
      city_ibge_code: team.cityIbgeCode,
      city_name: team.cityName,
      state: team.state,
      coordinator_name: team.coordinatorName,
      linked_leader_id: leader?.id ?? null,
      linked_leader_name: leader?.name ?? null,
      planned_headcount: team.plannedHeadcount,
      status: team.status ?? TeamStatus.ACTIVE,
      notes: team.notes,
      members_count: members.length,
      active_members_count: activeMembersCount,
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
      email: member.email,
      role: member.role,
      status: member.status ?? TeamMemberStatus.ACTIVE,
      city_ibge_code: member.cityIbgeCode,
      user_id: member.userId,
      created_at: member.createdAt,
      updated_at: member.updatedAt,
    };
  }

  private generateTemporaryPassword() {
    const random = Math.random().toString(36).slice(-6).toUpperCase();
    return `Polis@${random}`;
  }
}
