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

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Table({ tableName: 'teams', timestamps: true, underscored: true })
export class TeamModel extends Model {
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
  @Column(DataType.STRING(140))
  declare coordinatorName: string | null;

  @AllowNull(false)
  @Default(TeamStatus.ACTIVE)
  @Column(DataType.STRING(20))
  declare status: TeamStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @BelongsTo(() => CampaignModel, 'campaignId')
  declare campaign?: CampaignModel;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
