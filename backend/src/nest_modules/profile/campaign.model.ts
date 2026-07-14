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
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserModel } from '../../core/users/infrastructure/database/sequelize/models/user.model';

export enum CampaignStatus {
  PRE_CAMPAIGN = 'PRE_CAMPAIGN',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

@Table({ tableName: 'campaigns', timestamps: true, underscored: true })
export class CampaignModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare ownerUserId: string;

  @AllowNull(false)
  @Column(DataType.STRING(180))
  declare name: string;

  @AllowNull(false)
  @Column(DataType.STRING(180))
  declare candidateName: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare electionYear: number;

  @AllowNull(false)
  @Column(DataType.CHAR(2))
  declare state: string;

  @AllowNull(false)
  @Column(DataType.STRING(80))
  declare intendedOffice: string;

  @AllowNull(true)
  @Column(DataType.STRING(40))
  declare party: string | null;

  @AllowNull(false)
  @Default(CampaignStatus.PRE_CAMPAIGN)
  @Column(DataType.STRING(30))
  declare status: CampaignStatus;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  declare startDate: string | null;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  declare electionDate: string | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare voteGoal: number | null;

  @BelongsTo(() => UserModel, 'ownerUserId')
  declare owner?: UserModel;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
