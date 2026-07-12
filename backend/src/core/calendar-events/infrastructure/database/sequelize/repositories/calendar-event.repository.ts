import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CalendarEventRepository } from '../../../../domain/contracts/calendar-event-repository.interface';
import {
  CreateCalendarEventInput,
  ListCalendarEventsInput,
  ListCalendarMonthMarkersInput,
  UpdateCalendarEventInput,
} from '../../../../domain/contracts/calendar-event.types';
import { CalendarEventRecurrenceType } from '../../../../domain/enums/calendar-event-recurrence-type.enum';
import { CalendarEventStatus } from '../../../../domain/enums/calendar-event-status.enum';
import { CalendarEventAuditLogModel } from '../models/calendar-event-audit-log.model';
import { CalendarEventModel } from '../models/calendar-event.model';

@Injectable()
export class CalendarEventSequelizeRepository implements CalendarEventRepository {
  constructor(
    @InjectModel(CalendarEventModel)
    private readonly calendarEvents: typeof CalendarEventModel,
    @InjectModel(CalendarEventAuditLogModel)
    private readonly audits: typeof CalendarEventAuditLogModel,
  ) {}

  async list(query: ListCalendarEventsInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const rows = await this.calendarEvents.findAll({
      where: this.buildWhere(query),
      order: [
        ['eventDate', 'ASC'],
        ['startTime', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    const data = this.expandOccurrences(rows, query);
    const total = data.length;

    return {
      data: data.slice((page - 1) * limit, page * limit),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async get(id: string) {
    const item = await this.find(id);
    return this.present(item);
  }

  async create(dto: CreateCalendarEventInput, actorId: string) {
    this.assertTimes(dto.allDay, dto.startTime ?? null, dto.endTime ?? null);
    this.assertRecurrence(dto);

    const item = await this.calendarEvents.create({
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      eventDate: dto.eventDate,
      allDay: dto.allDay,
      startTime: dto.allDay ? null : (dto.startTime ?? null),
      endTime: dto.allDay ? null : (dto.endTime ?? null),
      category: dto.category?.trim() || null,
      status: dto.status ?? CalendarEventStatus.ACTIVE,
      recurrenceType: dto.recurrenceType ?? CalendarEventRecurrenceType.NONE,
      recurrenceInterval: dto.recurrenceInterval ?? 1,
      recurrenceUntil: dto.recurrenceUntil ?? null,
      recurrenceDays:
        dto.recurrenceType === CalendarEventRecurrenceType.WEEKLY
          ? this.normalizeRecurrenceDays(dto.recurrenceDays)
          : null,
      createdBy: actorId,
      updatedBy: actorId,
    });

    await this.audit(item.id, actorId, 'created', {
      status: item.status,
      eventDate: item.eventDate,
      recurrenceType: item.recurrenceType,
    });

    return this.present(item);
  }

  async update(id: string, dto: UpdateCalendarEventInput, actorId: string) {
    const item = await this.find(id);

    const nextAllDay = dto.allDay ?? item.allDay;
    const nextStartTime =
      dto.startTime !== undefined ? dto.startTime : item.startTime;
    const nextEndTime = dto.endTime !== undefined ? dto.endTime : item.endTime;
    const nextRecurrenceType = dto.recurrenceType ?? item.recurrenceType;
    const nextRecurrenceInterval =
      dto.recurrenceInterval ?? item.recurrenceInterval;
    const nextRecurrenceUntil =
      dto.recurrenceUntil !== undefined
        ? dto.recurrenceUntil
        : item.recurrenceUntil;
    const nextRecurrenceDays =
      dto.recurrenceDays !== undefined
        ? dto.recurrenceDays
        : item.recurrenceDays;

    this.assertTimes(nextAllDay, nextStartTime, nextEndTime);
    this.assertRecurrence({
      eventDate: dto.eventDate ?? item.eventDate,
      recurrenceType: nextRecurrenceType,
      recurrenceInterval: nextRecurrenceInterval,
      recurrenceUntil: nextRecurrenceUntil,
      recurrenceDays: nextRecurrenceDays,
    });

    const changes = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description?.trim() || null }
        : {}),
      ...(dto.eventDate !== undefined ? { eventDate: dto.eventDate } : {}),
      ...(dto.allDay !== undefined ? { allDay: dto.allDay } : {}),
      ...(dto.category !== undefined
        ? { category: dto.category?.trim() || null }
        : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.recurrenceType !== undefined
        ? { recurrenceType: dto.recurrenceType }
        : {}),
      ...(dto.recurrenceInterval !== undefined
        ? { recurrenceInterval: dto.recurrenceInterval }
        : {}),
      ...(dto.recurrenceUntil !== undefined
        ? { recurrenceUntil: dto.recurrenceUntil }
        : {}),
      ...(dto.recurrenceDays !== undefined
        ? {
            recurrenceDays:
              nextRecurrenceType === CalendarEventRecurrenceType.WEEKLY
                ? this.normalizeRecurrenceDays(dto.recurrenceDays)
                : null,
          }
        : {}),
      startTime: nextAllDay ? null : (nextStartTime ?? null),
      endTime: nextAllDay ? null : (nextEndTime ?? null),
      updatedBy: actorId,
    };

    await item.update(changes);
    await this.audit(id, actorId, 'updated', changes);

    return this.present(item);
  }

  async remove(id: string, actorId: string) {
    const item = await this.find(id);
    await this.audit(id, actorId, 'deleted', null);
    await item.destroy();
  }

  async listMonthMarkers(query: ListCalendarMonthMarkersInput) {
    const month = Number(query.month);
    const year = Number(query.year);

    if (month < 1 || month > 12)
      throw new BadRequestException('Month must be between 1 and 12');

    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-${String(
      new Date(year, month, 0).getDate(),
    ).padStart(2, '0')}`;

    const rows = await this.calendarEvents.findAll({
      where: this.buildWhere({ from, to }),
      order: [['eventDate', 'ASC']],
    });

    return {
      year,
      month,
      days: [
        ...new Set(
          this.expandOccurrences(rows, { from, to }).map((item) => item.eventDate),
        ),
      ],
    };
  }

  async getAudit(id: string) {
    await this.find(id);
    const items = await this.audits.findAll({
      where: { calendarEventId: id },
      order: [['createdAt', 'DESC']],
    });
    return items.map((item) => ({
      id: item.id,
      calendarEventId: item.calendarEventId,
      actorId: item.actorId,
      action: item.action,
      changes: item.changes,
      createdAt: item.createdAt,
    }));
  }

  private buildWhere(query: ListCalendarEventsInput) {
    const where: Record<string, unknown> = {};
    const andFilters: unknown[] = [];

    if (query.status) andFilters.push({ status: query.status });
    if (query.recurrenceType)
      andFilters.push({ recurrenceType: query.recurrenceType });
    if (query.search) {
      andFilters.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${query.search}%` } },
          { description: { [Op.iLike]: `%${query.search}%` } },
          { category: { [Op.iLike]: `%${query.search}%` } },
        ],
      });
    }

    if (query.date) {
      andFilters.push({
        [Op.or]: [
          { eventDate: query.date },
          {
            recurrenceType: { [Op.ne]: CalendarEventRecurrenceType.NONE },
            eventDate: { [Op.lte]: query.date },
            [Op.or]: [
              { recurrenceUntil: null },
              { recurrenceUntil: { [Op.gte]: query.date } },
            ],
          },
        ],
      });
    } else if (query.from || query.to) {
      andFilters.push({
        [Op.or]: [
          {
            eventDate: {
              ...(query.from ? { [Op.gte]: query.from } : {}),
              ...(query.to ? { [Op.lte]: query.to } : {}),
            },
          },
          {
            recurrenceType: { [Op.ne]: CalendarEventRecurrenceType.NONE },
            ...(query.to ? { eventDate: { [Op.lte]: query.to } } : {}),
            [Op.or]: [
              { recurrenceUntil: null },
              ...(query.from
                ? [{ recurrenceUntil: { [Op.gte]: query.from } }]
                : []),
            ],
          },
        ],
      });
    }

    if (andFilters.length) where[Op.and as unknown as string] = andFilters;
    return where;
  }

  private expandOccurrences(
    items: CalendarEventModel[],
    query: ListCalendarEventsInput,
  ) {
    const from = query.date ?? query.from ?? null;
    const to = query.date ?? query.to ?? query.from ?? null;
    const expanded = items.flatMap((item) =>
      this.expandEventOccurrences(item, from, to),
    );

    return expanded.sort((a, b) => {
      if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
      return (a.startTime ?? '').localeCompare(b.startTime ?? '');
    });
  }

  private expandEventOccurrences(
    item: CalendarEventModel,
    from: string | null,
    to: string | null,
  ) {
    const base = this.present(item);
    const recurrenceType =
      item.recurrenceType ?? CalendarEventRecurrenceType.NONE;

    if (!from && !to) return [base];
    if (recurrenceType === CalendarEventRecurrenceType.NONE) {
      return this.isDateInRange(item.eventDate, from, to) ? [base] : [];
    }

    const interval = Math.max(item.recurrenceInterval ?? 1, 1);
    const lastOccurrenceDate = item.recurrenceUntil ?? to ?? from ?? item.eventDate;
    const start = new Date(`${item.eventDate}T00:00:00`);
    const cursor = new Date(start);
    const hardStop = new Date(`${lastOccurrenceDate}T00:00:00`);
    const dates: string[] = [];

    while (cursor <= hardStop) {
      const currentDate = this.toDateKey(cursor);
      if (this.matchesRecurrence(item, start, cursor, interval, recurrenceType)) {
        if (this.isDateInRange(currentDate, from, to)) dates.push(currentDate);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return dates.map((eventDate) => ({
      ...base,
      eventDate,
      sourceEventDate: item.eventDate,
    }));
  }

  private matchesRecurrence(
    item: CalendarEventModel,
    start: Date,
    candidate: Date,
    interval: number,
    recurrenceType: CalendarEventRecurrenceType,
  ) {
    const diffDays = Math.floor(
      (candidate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    switch (recurrenceType) {
      case CalendarEventRecurrenceType.DAILY:
        return diffDays % interval === 0;
      case CalendarEventRecurrenceType.WEEKLY: {
        const diffWeeks = Math.floor(diffDays / 7);
        const days = item.recurrenceDays?.length
          ? item.recurrenceDays
          : [start.getDay()];
        return diffWeeks % interval === 0 && days.includes(candidate.getDay());
      }
      case CalendarEventRecurrenceType.MONTHLY: {
        const diffMonths =
          (candidate.getFullYear() - start.getFullYear()) * 12 +
          (candidate.getMonth() - start.getMonth());
        return candidate.getDate() === start.getDate() && diffMonths % interval === 0;
      }
      case CalendarEventRecurrenceType.YEARLY: {
        const diffYears = candidate.getFullYear() - start.getFullYear();
        return (
          candidate.getDate() === start.getDate() &&
          candidate.getMonth() === start.getMonth() &&
          diffYears % interval === 0
        );
      }
      default:
        return this.toDateKey(candidate) === item.eventDate;
    }
  }

  private isDateInRange(
    eventDate: string,
    from: string | null,
    to: string | null,
  ) {
    if (from && eventDate < from) return false;
    if (to && eventDate > to) return false;
    return true;
  }

  private toDateKey(date: Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private assertTimes(
    allDay: boolean,
    startTime: string | null,
    endTime: string | null,
  ) {
    if (allDay) return;
    if (!startTime || !endTime)
      throw new BadRequestException('Timed events require start and end times');
    if (endTime <= startTime)
      throw new BadRequestException('End time must be greater than start time');
  }

  private assertRecurrence(
    dto: Partial<
      CreateCalendarEventInput & UpdateCalendarEventInput & { eventDate: string }
    >,
  ) {
    const recurrenceType = dto.recurrenceType ?? CalendarEventRecurrenceType.NONE;
    if (recurrenceType === CalendarEventRecurrenceType.NONE) return;
    if ((dto.recurrenceInterval ?? 1) < 1)
      throw new BadRequestException(
        'Recurrence interval must be greater than zero',
      );
    if (dto.recurrenceUntil && dto.eventDate && dto.recurrenceUntil < dto.eventDate)
      throw new BadRequestException(
        'Recurrence end date must be on or after event date',
      );
  }

  private normalizeRecurrenceDays(days: number[] | null | undefined) {
    if (!days?.length) return null;
    const normalized = [...new Set(days.map((day) => Number(day)))].sort(
      (a, b) => a - b,
    );
    if (normalized.some((day) => day < 0 || day > 6))
      throw new BadRequestException('Weekly recurrence days must be between 0 and 6');
    return normalized;
  }

  private async find(id: string) {
    const item = await this.calendarEvents.findByPk(id);
    if (!item) throw new NotFoundException('Calendar event not found');
    return item;
  }

  private present(item: CalendarEventModel) {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      eventDate: item.eventDate,
      allDay: item.allDay,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      status: item.status,
      recurrenceType: item.recurrenceType ?? CalendarEventRecurrenceType.NONE,
      recurrenceInterval: item.recurrenceInterval ?? 1,
      recurrenceUntil: item.recurrenceUntil,
      recurrenceDays: item.recurrenceDays,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private async audit(
    calendarEventId: string,
    actorId: string,
    action: string,
    changes: Record<string, unknown> | null,
  ) {
    await this.audits.create({ calendarEventId, actorId, action, changes });
  }
}
