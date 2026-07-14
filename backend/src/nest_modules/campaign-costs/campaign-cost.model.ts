import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { CampaignModel } from '../profile/campaign.model';

@Table({ tableName: 'campaign_costs', timestamps: true, underscored: true })
export class CampaignCostModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => CampaignModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare campaignId: string;

  @AllowNull(false)
  @Column(DataType.STRING(7))
  declare cityIbgeCode: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare cityName: string;

  @AllowNull(false)
  @Column(DataType.STRING(80))
  declare regionId: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare regionName: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(14, 2))
  declare amount: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare spentAt: Date;

  @BelongsTo(() => CampaignModel, 'campaignId')
  declare campaign?: CampaignModel;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
