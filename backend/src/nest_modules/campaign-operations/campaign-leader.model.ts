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
import { TeamModel } from '../teams/team.model';

export enum CampaignLeaderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Table({ tableName: 'campaign_leaders', timestamps: true, underscored: true })
export class CampaignLeaderModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => CampaignModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare campaignId: string;

  @AllowNull(false)
  @Column(DataType.STRING(140))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  declare phone: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(7))
  declare cityIbgeCode: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare cityName: string;

  @AllowNull(false)
  @Column(DataType.CHAR(2))
  declare state: string;

  @AllowNull(true)
  @Column(DataType.STRING(80))
  declare source: string | null;

  @AllowNull(false)
  @Default(CampaignLeaderStatus.ACTIVE)
  @Column(DataType.STRING(20))
  declare status: CampaignLeaderStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @ForeignKey(() => TeamModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare teamId: string | null;

  @BelongsTo(() => CampaignModel, 'campaignId')
  declare campaign?: CampaignModel;

  @BelongsTo(() => TeamModel, 'teamId')
  declare team?: TeamModel;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
