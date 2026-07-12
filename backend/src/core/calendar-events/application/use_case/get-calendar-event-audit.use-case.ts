import { CalendarEventRepository } from '../../domain/contracts/calendar-event-repository.interface';

export class GetCalendarEventAuditUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  execute(id: string) {
    return this.repository.getAudit(id);
  }
}
