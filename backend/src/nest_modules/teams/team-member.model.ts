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
import { UserModel } from '../../core/users/infrastructure/database/sequelize/models/user.model';
import { TeamModel } from './team.model';

export enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Table({ tableName: 'team_members', timestamps: true, underscored: true })
export class TeamMemberModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => TeamModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare teamId: string;

  @AllowNull(false)
  @Column(DataType.STRING(140))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  declare phone: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(180))
  declare email: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(80))
  declare role: string;

  @AllowNull(false)
  @Default(TeamMemberStatus.ACTIVE)
  @Column(DataType.STRING(20))
  declare status: TeamMemberStatus;

  @AllowNull(true)
  @Column(DataType.STRING(7))
  declare cityIbgeCode: string | null;

  @ForeignKey(() => UserModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare userId: string | null;

  @BelongsTo(() => TeamModel, 'teamId')
  declare team?: TeamModel;

  @BelongsTo(() => UserModel, 'userId')
  declare user?: UserModel;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
