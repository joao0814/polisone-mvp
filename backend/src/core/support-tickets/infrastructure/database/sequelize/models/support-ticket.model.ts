import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserModel } from '../../../../../users/infrastructure/database/sequelize/models/user.model';
import { SupportTicketDepartment } from '../../../../domain/enums/support-ticket-department.enum';
import { SupportTicketPriority } from '../../../../domain/enums/support-ticket-priority.enum';
import { SupportTicketStatus } from '../../../../domain/enums/support-ticket-status.enum';
import { SupportTicketMessageModel } from './support-ticket-message.model';

@Table({
  tableName: 'support_tickets',
  timestamps: true,
  underscored: true,
})
export class SupportTicketModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(32))
  declare protocol: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare requesterId: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare subject: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(SupportTicketDepartment)))
  declare department: SupportTicketDepartment;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare subcategory: string | null;

  @AllowNull(false)
  @Default(SupportTicketPriority.MEDIUM)
  @Column(DataType.ENUM(...Object.values(SupportTicketPriority)))
  declare priority: SupportTicketPriority;

  @AllowNull(false)
  @Default(SupportTicketStatus.OPEN)
  @Column(DataType.ENUM(...Object.values(SupportTicketStatus)))
  declare status: SupportTicketStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare closedAt: Date | null;

  @BelongsTo(() => UserModel, 'requesterId')
  declare requester?: UserModel;

  @HasMany(() => SupportTicketMessageModel)
  declare messages?: SupportTicketMessageModel[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
