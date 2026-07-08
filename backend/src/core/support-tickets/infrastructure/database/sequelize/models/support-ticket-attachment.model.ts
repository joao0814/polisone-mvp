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
} from 'sequelize-typescript';
import { SupportTicketMessageModel } from './support-ticket-message.model';

@Table({
  tableName: 'support_ticket_attachments',
  timestamps: true,
  underscored: true,
  updatedAt: false,
})
export class SupportTicketAttachmentModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => SupportTicketMessageModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare messageId: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare fileName: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare storagePath: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare mimeType: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare size: number;

  @BelongsTo(() => SupportTicketMessageModel, 'messageId')
  declare message?: SupportTicketMessageModel;

  @CreatedAt
  declare createdAt: Date;
}
