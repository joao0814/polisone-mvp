import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CampaignModel } from '../profile/campaign.model';
import { CampaignCheckInModel } from './campaign-check-in.model';
import { CampaignLeaderModel } from './campaign-leader.model';
import { CreateCampaignCheckInDto } from './dto/create-campaign-check-in.dto';
import { CreateCampaignLeaderDto } from './dto/create-campaign-leader.dto';
import { CreateFieldActivityDto } from './dto/create-field-activity.dto';
import { FieldActivityModel } from './field-activity.model';

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
  ) {}

  async listCheckIns(userId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const items = await this.campaignCheckInModel.findAll({
      where: { campaignId: campaign.id },
      order: [['checkedInAt', 'DESC']],
    });

    return { campaign_id: campaign.id, items: items.map((item) => this.toCheckInHTTP(item)) };
  }

  async createCheckIn(userId: string, dto: CreateCampaignCheckInDto) {
    const campaign = await this.getCampaignForUser(userId);
    const item = await this.campaignCheckInModel.create({
      campaignId: campaign.id,
      ...this.normalizeCheckInInput(dto),
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
    const item = await this.campaignLeaderModel.create({
      campaignId: campaign.id,
      ...this.normalizeLeaderInput(dto),
    });

    return this.toLeaderHTTP(item);
  }

  private async getCampaignForUser(userId: string) {
    const campaign = await this.campaignModel.findOne({
      where: { ownerUserId: userId },
    });

    if (!campaign) {
      throw new BadRequestException(
        'Cadastre os dados da campanha antes de registrar operacoes.',
      );
    }

    return campaign;
  }

  private normalizeCheckInInput(dto: CreateCampaignCheckInDto) {
    return {
      ...(dto.teamId !== undefined ? { teamId: dto.teamId || null } : {}),
      ...(dto.memberId !== undefined ? { memberId: dto.memberId || null } : {}),
      cityIbgeCode: dto.cityIbgeCode,
      cityName: dto.cityName.trim(),
      state: dto.state.toUpperCase(),
      type: dto.type,
      notes: dto.notes?.trim() || null,
      checkedInAt: dto.checkedInAt ? new Date(dto.checkedInAt) : new Date(),
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
    };
  }

  private toCheckInHTTP(item: CampaignCheckInModel) {
    return {
      id: item.id,
      campaign_id: item.campaignId,
      team_id: item.teamId,
      member_id: item.memberId,
      city_ibge_code: item.cityIbgeCode,
      city_name: item.cityName,
      state: item.state,
      type: item.type,
      notes: item.notes,
      checked_in_at: item.checkedInAt,
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
