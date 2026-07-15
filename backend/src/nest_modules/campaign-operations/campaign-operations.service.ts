import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CampaignModel } from '../profile/campaign.model';
import {
  CampaignCheckInModel,
  CampaignCheckInStatus,
} from './campaign-check-in.model';
import { CampaignLeaderModel } from './campaign-leader.model';
import { CheckoutCampaignCheckInDto } from './dto/checkout-campaign-check-in.dto';
import { CreateCampaignCheckInDto } from './dto/create-campaign-check-in.dto';
import { CreateCampaignLeaderDto } from './dto/create-campaign-leader.dto';
import { CreateFieldActivityDto } from './dto/create-field-activity.dto';
import { ListCampaignCheckInsDto } from './dto/list-campaign-check-ins.dto';
import { UpdateCampaignCheckInDto } from './dto/update-campaign-check-in.dto';
import { FieldActivityModel } from './field-activity.model';
import { TeamMemberModel } from '../teams/team-member.model';
import { TeamModel } from '../teams/team.model';

@Injectable()
export class CampaignOperationsService {
  constructor(
    @InjectModel(CampaignModel)
    private readonly campaignModel: typeof CampaignModel,
    @InjectModel(CampaignCheckInModel)
    private readonly campaignCheckInModel: typeof CampaignCheckInModel,
    @InjectModel(FieldActivityModel)
    private readonly fieldActivityModel: typeof FieldActivityModel,
    @InjectModel(CampaignLeaderModel)
    private readonly campaignLeaderModel: typeof CampaignLeaderModel,
    @InjectModel(TeamMemberModel)
    private readonly teamMemberModel: typeof TeamMemberModel,
    @InjectModel(TeamModel)
    private readonly teamModel: typeof TeamModel,
  ) {}

  async listCheckIns(userId: string, query: ListCampaignCheckInsDto) {
    const campaign = await this.getCampaignForUser(userId);
    const normalizedSearch = query.search?.trim();
    const where = {
      campaignId: campaign.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.teamId ? { teamId: query.teamId } : {}),
      ...(query.personType ? { personType: query.personType } : {}),
      ...(query.cityIbgeCode ? { cityIbgeCode: query.cityIbgeCode } : {}),
      ...(query.activityType ? { activityType: query.activityType } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            checkedInAt: {
              ...(query.dateFrom ? { [Op.gte]: new Date(`${query.dateFrom}T00:00:00`) } : {}),
              ...(query.dateTo ? { [Op.lte]: new Date(`${query.dateTo}T23:59:59.999`) } : {}),
            },
          }
        : {}),
      ...(normalizedSearch
        ? {
            [Op.or]: [
              { personName: { [Op.iLike]: `%${normalizedSearch}%` } },
              { cityName: { [Op.iLike]: `%${normalizedSearch}%` } },
              { state: { [Op.iLike]: `%${normalizedSearch}%` } },
              { activityType: { [Op.iLike]: `%${normalizedSearch}%` } },
            ],
          }
        : {}),
    };
    const items = await this.campaignCheckInModel.findAll({
      where,
      order: [['checkedInAt', 'DESC']],
    });

    return { campaign_id: campaign.id, items: items.map((item) => this.toCheckInHTTP(item)) };
  }

  async createCheckIn(userId: string, dto: CreateCampaignCheckInDto) {
    const campaign = await this.getCampaignForUser(userId);
    await this.ensureOwnedTeam(campaign.id, dto.teamId);
    await this.ensureNoOpenCheckIn(
      campaign.id,
      dto.personType,
      dto.personId,
    );
    const item = await this.campaignCheckInModel.create({
      campaignId: campaign.id,
      ...this.normalizeCheckInInput(dto),
    });

    return this.toCheckInHTTP(item);
  }

  async getCheckInById(userId: string, checkInId: string) {
    const item = await this.getOwnedCheckIn(userId, checkInId);
    return this.toCheckInHTTP(item);
  }

  async updateCheckIn(
    userId: string,
    checkInId: string,
    dto: UpdateCampaignCheckInDto,
  ) {
    const item = await this.getOwnedCheckIn(userId, checkInId);

    if (dto.teamId) {
      await this.ensureOwnedTeam(item.campaignId, dto.teamId);
    }

    const nextPersonType = dto.personType ?? item.personType;
    const nextPersonId = dto.personId ?? item.personId;
    if (
      (dto.personType || dto.personId) &&
      (nextPersonType !== item.personType || nextPersonId !== item.personId)
    ) {
      await this.ensureNoOpenCheckIn(
        item.campaignId,
        nextPersonType,
        nextPersonId,
        item.id,
      );
    }

    await item.update(this.normalizeCheckInUpdateInput(dto));
    return this.toCheckInHTTP(item);
  }

  async checkoutCheckIn(
    userId: string,
    checkInId: string,
    dto: CheckoutCampaignCheckInDto,
  ) {
    const item = await this.getOwnedCheckIn(userId, checkInId);

    if (item.status !== CampaignCheckInStatus.CHECKED_IN) {
      throw new BadRequestException(
        'Somente check-ins em aberto podem receber check-out.',
      );
    }

    await item.update({
      ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
      checkedOutAt: dto.checkedOutAt ? new Date(dto.checkedOutAt) : new Date(),
      status: CampaignCheckInStatus.CHECKED_OUT,
    });

    return this.toCheckInHTTP(item);
  }

  async cancelCheckIn(userId: string, checkInId: string) {
    const item = await this.getOwnedCheckIn(userId, checkInId);

    if (item.status === CampaignCheckInStatus.CANCELED) {
      throw new BadRequestException('Este check-in ja foi cancelado.');
    }

    await item.update({
      status: CampaignCheckInStatus.CANCELED,
      checkedOutAt: item.checkedOutAt ?? new Date(),
    });

    return this.toCheckInHTTP(item);
  }

  async listActivities(userId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const items = await this.fieldActivityModel.findAll({
      where: { campaignId: campaign.id },
      order: [['happenedAt', 'DESC']],
    });

    return { campaign_id: campaign.id, items: items.map((item) => this.toActivityHTTP(item)) };
  }

  async createActivity(userId: string, dto: CreateFieldActivityDto) {
    const campaign = await this.getCampaignForUser(userId);
    const item = await this.fieldActivityModel.create({
      campaignId: campaign.id,
      ...this.normalizeActivityInput(dto),
    });

    return this.toActivityHTTP(item);
  }

  async listLeaders(userId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const items = await this.campaignLeaderModel.findAll({
      where: { campaignId: campaign.id },
      order: [['createdAt', 'DESC']],
    });

    return { campaign_id: campaign.id, items: items.map((item) => this.toLeaderHTTP(item)) };
  }

  async createLeader(userId: string, dto: CreateCampaignLeaderDto) {
    const campaign = await this.getCampaignForUser(userId);
    if (dto.teamId) {
      await this.ensureOwnedTeam(campaign.id, dto.teamId);
    }

    const item = await this.campaignLeaderModel.create({
      campaignId: campaign.id,
      ...this.normalizeLeaderInput(dto),
    });

    return this.toLeaderHTTP(item);
  }

  private async getCampaignForUser(userId: string) {
    const campaign =
      (await this.campaignModel.findOne({
        where: { ownerUserId: userId },
      })) ??
      (await this.resolveCampaignByTeamMember(userId));

    if (!campaign) {
      throw new BadRequestException(
        'Cadastre os dados da campanha antes de registrar operacoes.',
      );
    }

    return campaign;
  }

  private async resolveCampaignByTeamMember(userId: string) {
    const member = await this.teamMemberModel.findOne({
      where: { userId },
      include: [TeamModel],
    });

    if (!member?.team?.campaignId) {
      return null;
    }

    return this.campaignModel.findByPk(member.team.campaignId);
  }

  private async getOwnedCheckIn(userId: string, checkInId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const item = await this.campaignCheckInModel.findOne({
      where: { id: checkInId, campaignId: campaign.id },
    });

    if (!item) {
      throw new NotFoundException('Campaign check-in not found');
    }

    return item;
  }

  private async ensureOwnedTeam(campaignId: string, teamId: string) {
    const team = await this.teamModel.findOne({
      where: { id: teamId, campaignId },
    });

    if (!team) {
      throw new BadRequestException(
        'A equipe informada nao pertence a campanha atual.',
      );
    }
  }

  private async ensureNoOpenCheckIn(
    campaignId: string,
    personType: string,
    personId: string,
    ignoreId?: string,
  ) {
    const item = await this.campaignCheckInModel.findOne({
      where: {
        campaignId,
        personType,
        personId,
        status: CampaignCheckInStatus.CHECKED_IN,
        ...(ignoreId ? { id: { [Op.ne]: ignoreId } } : {}),
      },
    });

    if (item) {
      throw new BadRequestException(
        'Esta pessoa ja possui um check-in em aberto.',
      );
    }
  }

  private normalizeCheckInInput(dto: CreateCampaignCheckInDto) {
    return {
      teamId: dto.teamId,
      personType: dto.personType,
      personId: dto.personId,
      personName: dto.personName.trim(),
      ...(dto.memberId !== undefined ? { memberId: dto.memberId || null } : {}),
      cityIbgeCode: dto.cityIbgeCode,
      cityName: dto.cityName.trim(),
      state: dto.state.toUpperCase(),
      activityType: dto.activityType,
      notes: dto.notes?.trim() || null,
      checkedInAt: dto.checkedInAt ? new Date(dto.checkedInAt) : new Date(),
      status: CampaignCheckInStatus.CHECKED_IN,
      checkedOutAt: null,
    };
  }

  private normalizeCheckInUpdateInput(dto: UpdateCampaignCheckInDto) {
    return {
      ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
      ...(dto.personType !== undefined ? { personType: dto.personType } : {}),
      ...(dto.personId !== undefined ? { personId: dto.personId } : {}),
      ...(dto.personName !== undefined
        ? { personName: dto.personName.trim() }
        : {}),
      ...(dto.memberId !== undefined ? { memberId: dto.memberId || null } : {}),
      ...(dto.cityIbgeCode !== undefined
        ? { cityIbgeCode: dto.cityIbgeCode }
        : {}),
      ...(dto.cityName !== undefined ? { cityName: dto.cityName.trim() } : {}),
      ...(dto.state !== undefined ? { state: dto.state.toUpperCase() } : {}),
      ...(dto.activityType !== undefined
        ? { activityType: dto.activityType }
        : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
    };
  }

  private normalizeActivityInput(dto: CreateFieldActivityDto) {
    return {
      ...(dto.teamId !== undefined ? { teamId: dto.teamId || null } : {}),
      ...(dto.memberId !== undefined ? { memberId: dto.memberId || null } : {}),
      cityIbgeCode: dto.cityIbgeCode,
      cityName: dto.cityName.trim(),
      state: dto.state.toUpperCase(),
      activityType: dto.activityType.trim(),
      quantity: dto.quantity ?? 1,
      notes: dto.notes?.trim() || null,
      happenedAt: dto.happenedAt ? new Date(dto.happenedAt) : new Date(),
    };
  }

  private normalizeLeaderInput(dto: CreateCampaignLeaderDto) {
    return {
      name: dto.name.trim(),
      phone: dto.phone?.trim() || null,
      cityIbgeCode: dto.cityIbgeCode,
      cityName: dto.cityName.trim(),
      state: dto.state.toUpperCase(),
      source: dto.source?.trim() || null,
      status: dto.status,
      notes: dto.notes?.trim() || null,
      teamId: dto.teamId || null,
    };
  }

  private toCheckInHTTP(item: CampaignCheckInModel) {
    return {
      id: item.id,
      campaign_id: item.campaignId,
      team_id: item.teamId,
      person_type: item.personType,
      person_id: item.personId,
      person_name: item.personName,
      member_id: item.memberId,
      city_ibge_code: item.cityIbgeCode,
      city_name: item.cityName,
      state: item.state,
      activity_type: item.activityType,
      notes: item.notes,
      checked_in_at: item.checkedInAt,
      checked_out_at: item.checkedOutAt,
      status: item.status,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private toActivityHTTP(item: FieldActivityModel) {
    return {
      id: item.id,
      campaign_id: item.campaignId,
      team_id: item.teamId,
      member_id: item.memberId,
      city_ibge_code: item.cityIbgeCode,
      city_name: item.cityName,
      state: item.state,
      activity_type: item.activityType,
      quantity: item.quantity,
      notes: item.notes,
      happened_at: item.happenedAt,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private toLeaderHTTP(item: CampaignLeaderModel) {
    return {
      id: item.id,
      campaign_id: item.campaignId,
      team_id: item.teamId,
      name: item.name,
      phone: item.phone,
      city_ibge_code: item.cityIbgeCode,
      city_name: item.cityName,
      state: item.state,
      source: item.source,
      status: item.status,
      notes: item.notes,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }
}
