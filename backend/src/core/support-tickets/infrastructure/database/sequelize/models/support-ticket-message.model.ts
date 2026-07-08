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
  UpdatedAt,
} from 'sequelize-typescript';
import { UserModel } from '../../../../../users/infrastructure/database/sequelize/models/user.model';
import { SupportTicketMessageType } from '../../../../domain/enums/support-ticket-message-type.enum';
import { SupportTicketModel } from './support-ticket.model';
import { SupportTicketAttachmentModel } from './support-ticket-attachment.model';

@Table({
  tableName: 'support_ticket_messages',
  timestamps: true,
  underscored: true,
})
export class SupportTicketMessageModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => SupportTicketModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare ticketId: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare senderId: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare message: string;

  @AllowNull(false)
  @Default(SupportTicketMessageType.MESSAGE)
  @Column(DataType.ENUM(...Object.values(SupportTicketMessageType)))
  declare type: SupportTicketMessageType;

  @BelongsTo(() => SupportTicketModel, 'ticketId')
  declare ticket?: SupportTicketModel;

  @BelongsTo(() => UserModel, 'senderId')
  declare sender?: UserModel;

  @HasMany(() => SupportTicketAttachmentModel)
  declare attachments?: SupportTicketAttachmentModel[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
