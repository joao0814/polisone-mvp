import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'calendar_event_audit_logs',
  timestamps: true,
  updatedAt: false,
  underscored: true,
})
export class CalendarEventAuditLogModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'calendar_event_id' })
  declare calendarEventId: string;

  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'actor_id' })
  declare actorId: string;

  @AllowNull(false)
  @Column(DataType.STRING(40))
  declare action: string;

  @Column(DataType.JSONB)
  declare changes: Record<string, unknown> | null;

  @CreatedAt
  declare createdAt: Date;
}
