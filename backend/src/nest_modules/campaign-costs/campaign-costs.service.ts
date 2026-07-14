import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CampaignModel } from '../profile/campaign.model';
import { CampaignCostModel } from './campaign-cost.model';
import { CreateCampaignCostDto } from './dto/create-campaign-cost.dto';
import { UpdateCampaignCostDto } from './dto/update-campaign-cost.dto';

@Injectable()
export class CampaignCostsService {
  constructor(
    @InjectModel(CampaignModel)
    private readonly campaignModel: typeof CampaignModel,
    @InjectModel(CampaignCostModel)
    private readonly campaignCostModel: typeof CampaignCostModel,
  ) {}

  async list(userId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const items = await this.campaignCostModel.findAll({
      where: { campaignId: campaign.id },
      order: [['spentAt', 'DESC']],
    });

    return {
      campaign_id: campaign.id,
      items: items.map((item) => this.toHTTP(item)),
    };
  }

  async create(userId: string, dto: CreateCampaignCostDto) {
    const campaign = await this.getCampaignForUser(userId);
    const item = await this.campaignCostModel.create({
      campaignId: campaign.id,
      ...this.normalizeInput(dto, false),
    });

    return this.toHTTP(item);
  }

  async update(userId: string, costId: string, dto: UpdateCampaignCostDto) {
    const item = await this.getOwnedCost(userId, costId);
    await item.update(this.normalizeInput(dto, true));
    return this.toHTTP(item);
  }

  async remove(userId: string, costId: string) {
    const item = await this.getOwnedCost(userId, costId);
    await item.destroy();
  }

  private async getCampaignForUser(userId: string) {
    const campaign = await this.campaignModel.findOne({
      where: { ownerUserId: userId },
    });

    if (!campaign) {
      throw new BadRequestException(
        'Cadastre os dados da campanha antes de registrar custos.',
      );
    }

    return campaign;
  }

  private async getOwnedCost(userId: string, costId: string) {
    const campaign = await this.getCampaignForUser(userId);
    const item = await this.campaignCostModel.findOne({
      where: { id: costId, campaignId: campaign.id },
    });

    if (!item) {
      throw new NotFoundException('Campaign cost not found');
    }

    return item;
  }

  private normalizeInput(
    dto: CreateCampaignCostDto | UpdateCampaignCostDto,
    partial = false,
  ) {
    return {
      ...(!partial || dto.cityIbgeCode !== undefined
        ? { cityIbgeCode: dto.cityIbgeCode }
        : {}),
      ...(!partial || dto.cityName !== undefined
        ? { cityName: dto.cityName?.trim() }
        : {}),
      ...(!partial || dto.regionId !== undefined
        ? { regionId: dto.regionId?.trim() }
        : {}),
      ...(!partial || dto.regionName !== undefined
        ? { regionName: dto.regionName?.trim() }
        : {}),
      ...(!partial || dto.amount !== undefined
        ? { amount: dto.amount?.toFixed(2) }
        : {}),
      ...(!partial || dto.notes !== undefined
        ? { notes: dto.notes?.trim() || null }
        : {}),
      ...(!partial || dto.spentAt !== undefined
        ? { spentAt: dto.spentAt ? new Date(dto.spentAt) : new Date() }
        : {}),
    };
  }

  private toHTTP(item: CampaignCostModel) {
    return {
      id: item.id,
      campaign_id: item.campaignId,
      city_ibge_code: item.cityIbgeCode,
      city_name: item.cityName,
      region_id: item.regionId,
      region_name: item.regionName,
      amount: Number(item.amount),
      notes: item.notes,
      spent_at: item.spentAt,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }
}
