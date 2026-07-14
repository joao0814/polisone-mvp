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
import { TeamMemberModel } from '../teams/team-member.model';
import { TeamModel } from '../teams/team.model';

export enum CampaignCheckInType {
  PANFLETAGEM = 'PANFLETAGEM',
  ADESIVAGEM = 'ADESIVAGEM',
  VISITA = 'VISITA',
  REUNIAO = 'REUNIAO',
  EVENTO = 'EVENTO',
  PESQUISA_CAMPO = 'PESQUISA_CAMPO',
  OUTRO = 'OUTRO',
}

export enum CampaignCheckInPersonType {
  LEADER = 'LEADER',
  REPRESENTATIVE = 'REPRESENTATIVE',
}

export enum CampaignCheckInStatus {
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELED = 'CANCELED',
}

@Table({ tableName: 'campaign_check_ins', timestamps: true, underscored: true })
export class CampaignCheckInModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => CampaignModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare campaignId: string;

  @ForeignKey(() => TeamModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare teamId: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare personType: CampaignCheckInPersonType;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare personId: string;

  @AllowNull(false)
  @Column(DataType.STRING(140))
  declare personName: string;

  @ForeignKey(() => TeamMemberModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare memberId: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(7))
  declare cityIbgeCode: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare cityName: string;

  @AllowNull(false)
  @Column(DataType.CHAR(2))
  declare state: string;

  @AllowNull(false)
  @Default(CampaignCheckInType.OUTRO)
  @Column({ type: DataType.STRING(40), field: 'type' })
  declare activityType: CampaignCheckInType;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare checkedInAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare checkedOutAt: Date | null;

  @AllowNull(false)
  @Default(CampaignCheckInStatus.CHECKED_IN)
  @Column(DataType.STRING(20))
  declare status: CampaignCheckInStatus;

  @BelongsTo(() => CampaignModel, 'campaignId')
  declare campaign?: CampaignModel;

  @BelongsTo(() => TeamModel, 'teamId')
  declare team?: TeamModel;

  @BelongsTo(() => TeamMemberModel, 'memberId')
  declare member?: TeamMemberModel;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
