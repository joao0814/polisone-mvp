import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Communications API (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    const email = `communications.${Date.now()}@e2e.local`;
    const auth = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Admin E2E',
        email,
        password: 'Teste@123456',
        roles: ['ADMIN'],
      })
      .expect(201);
    token = auth.body.access_token as string;
  });

  afterAll(async () => app.close());

  it('creates, publishes, reads, measures, archives and hides a communication', async () => {
    const categories = await request(app.getHttpServer())
      .get('/communications/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const created = await request(app.getHttpServer())
      .post('/admin/communications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Fluxo E2E de comunicados',
        description: 'Validação do endpoint com PostgreSQL real.',
        content: '<p>Conteúdo seguro</p><script>alert(1)</script>',
        categoryId: categories.body[0].id,
        tags: ['e2e'],
      })
      .expect(201);
    expect(created.body.status).toBe('draft');
    expect(created.body.content).not.toContain('<script>');
    const published = await request(app.getHttpServer())
      .post(`/admin/communications/${created.body.id}/publish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    await request(app.getHttpServer())
      .get(`/communications/${published.body.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.views).toBe(1));
    await request(app.getHttpServer())
      .get(`/communications/${published.body.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.views).toBe(1));
    await request(app.getHttpServer())
      .get(`/admin/communications/${created.body.id}/audit`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.length).toBeGreaterThanOrEqual(2));
    await request(app.getHttpServer())
      .post(`/admin/communications/${created.body.id}/archive`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    await request(app.getHttpServer())
      .get(`/communications/${published.body.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/admin/communications/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('rejects administrative access for a regular user', async () => {
    const email = `communications.user.${Date.now()}@e2e.local`;
    const auth = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'User E2E', email, password: 'Teste@123456' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/admin/communications')
      .set('Authorization', `Bearer ${auth.body.access_token}`)
      .expect(403);
  });
});
