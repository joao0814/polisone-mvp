import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createCalendarEventsTableMigration } from '../src/shared/database/migrations/005-create-calendar-events-table';
import { createCalendarEventAuditLogsTableMigration } from '../src/shared/database/migrations/006-create-calendar-event-audit-logs-table';
import { addCalendarEventRecurrenceFieldsMigration } from '../src/shared/database/migrations/007-add-calendar-event-recurrence-fields';

describe('Calendar Events API (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_DATABASE ?? 'polisone',
    });
    const client = await pool.connect();
    try {
      await createCalendarEventsTableMigration.up(client);
      await createCalendarEventAuditLogsTableMigration.up(client);
      await addCalendarEventRecurrenceFieldsMigration.up(client);
    } finally {
      client.release();
      await pool.end();
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const email = `calendar.admin.${Date.now()}@e2e.local`;
    const auth = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Calendar Admin',
        email,
        password: 'Teste@123456',
        roles: ['ADMIN'],
      })
      .expect(201);

    adminToken = auth.body.access_token as string;
  });

  afterAll(async () => app.close());

  it('creates, updates, lists markers, reads audit and soft deletes a calendar event', async () => {
    const created = await request(app.getHttpServer())
      .post('/admin/calendar-events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Agenda E2E de calendario',
        description: 'Validacao completa do fluxo.',
        eventDate: '2026-07-21',
        allDay: false,
        startTime: '09:00',
        endTime: '10:00',
        category: 'Operacao',
        status: 'active',
      })
      .expect(201);

    expect(created.body.status).toBe('active');

    await request(app.getHttpServer())
      .patch(`/admin/calendar-events/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'completed',
        endTime: '10:30',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('completed');
        expect(body.endTime).toBe('10:30');
      });

    await request(app.getHttpServer())
      .get('/calendar-events')
      .query({ date: '2026-07-21' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => expect(body.data.length).toBeGreaterThanOrEqual(1));

    await request(app.getHttpServer())
      .get('/calendar-events/month-markers')
      .query({ year: 2026, month: 7 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) =>
        expect(body.days).toContain('2026-07-21'),
      );

    await request(app.getHttpServer())
      .get(`/admin/calendar-events/${created.body.id}/audit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => expect(body.length).toBeGreaterThanOrEqual(2));

    await request(app.getHttpServer())
      .delete(`/admin/calendar-events/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/calendar-events/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('rejects administrative access for a regular user', async () => {
    const email = `calendar.user.${Date.now()}@e2e.local`;
    const auth = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Calendar User', email, password: 'Teste@123456' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/admin/calendar-events')
      .set('Authorization', `Bearer ${auth.body.access_token as string}`)
      .send({
        title: 'Nao permitido',
        eventDate: '2026-07-22',
        allDay: true,
      })
      .expect(403);
  });

  it('expands recurring events in daily queries and month markers', async () => {
    await request(app.getHttpServer())
      .post('/admin/calendar-events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Rotina semanal de base',
        eventDate: '2026-07-07',
        allDay: true,
        recurrenceType: 'weekly',
        recurrenceInterval: 1,
        recurrenceUntil: '2026-07-31',
        recurrenceDays: [2, 4],
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/calendar-events')
      .query({ date: '2026-07-09' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => expect(body.data.length).toBeGreaterThanOrEqual(1));

    await request(app.getHttpServer())
      .get('/calendar-events/month-markers')
      .query({ year: 2026, month: 7 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.days).toContain('2026-07-09');
        expect(body.days).toContain('2026-07-14');
      });
  });
});
