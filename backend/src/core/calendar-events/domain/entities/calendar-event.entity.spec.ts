import { CalendarEventEntity } from './calendar-event.entity';

describe('CalendarEventEntity', () => {
  it('creates an all day event with normalized nullable times', () => {
    const event = CalendarEventEntity.create({
      title: '  Reuniao semanal  ',
      description: '  Alinhamento com a equipe  ',
      eventDate: '2026-07-16',
      allDay: true,
      startTime: '09:00',
      endTime: '10:00',
      category: '  Campanha  ',
      createdBy: 'user-id',
    });

    expect(event.title).toBe('Reuniao semanal');
    expect(event.description).toBe('Alinhamento com a equipe');
    expect(event.startTime).toBeNull();
    expect(event.endTime).toBeNull();
    expect(event.category).toBe('Campanha');
  });

  it('rejects timed events with invalid time range', () => {
    expect(() =>
      CalendarEventEntity.create({
        title: 'Treinamento',
        eventDate: '2026-07-16',
        allDay: false,
        startTime: '10:00',
        endTime: '09:00',
        createdBy: 'user-id',
      }),
    ).toThrow('End time must be greater than start time');
  });
});
