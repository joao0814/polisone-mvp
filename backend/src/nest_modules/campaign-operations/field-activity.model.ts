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

@Table({ tableName: 'field_activities', timestamps: true, underscored: true })
export class FieldActivityModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => CampaignModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare campaignId: string;

  @ForeignKey(() => TeamModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare teamId: string | null;

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
  @Column(DataType.STRING(80))
  declare activityType: string;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare quantity: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare happenedAt: Date;

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
