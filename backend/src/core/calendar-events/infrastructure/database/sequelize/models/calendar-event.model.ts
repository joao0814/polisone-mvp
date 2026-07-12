import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { CalendarEventRecurrenceType } from '../../../../domain/enums/calendar-event-recurrence-type.enum';
import { CalendarEventStatus } from '../../../../domain/enums/calendar-event-status.enum';

@Table({
  tableName: 'calendar_events',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class CalendarEventModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(180))
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Column({ type: DataType.DATEONLY, field: 'event_date' })
  declare eventDate: string;

  @AllowNull(false)
  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'all_day' })
  declare allDay: boolean;

  @Column({ type: DataType.TIME, field: 'start_time' })
  declare startTime: string | null;

  @Column({ type: DataType.TIME, field: 'end_time' })
  declare endTime: string | null;

  @Column(DataType.STRING(80))
  declare category: string | null;

  @AllowNull(false)
  @Default(CalendarEventStatus.ACTIVE)
  @Column(DataType.ENUM(...Object.values(CalendarEventStatus)))
  declare status: CalendarEventStatus;

  @AllowNull(false)
  @Default(CalendarEventRecurrenceType.NONE)
  @Column({
    type: DataType.ENUM(...Object.values(CalendarEventRecurrenceType)),
    field: 'recurrence_type',
  })
  declare recurrenceType: CalendarEventRecurrenceType;

  @AllowNull(false)
  @Default(1)
  @Column({ type: DataType.INTEGER, field: 'recurrence_interval' })
  declare recurrenceInterval: number;

  @Column({ type: DataType.DATEONLY, field: 'recurrence_until' })
  declare recurrenceUntil: string | null;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), field: 'recurrence_days' })
  declare recurrenceDays: number[] | null;

  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'created_by' })
  declare createdBy: string;

  @Column({ type: DataType.UUID, field: 'updated_by' })
  declare updatedBy: string | null;

  @Column({ type: DataType.DATE, field: 'deleted_at' })
  declare deletedAt: Date | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
