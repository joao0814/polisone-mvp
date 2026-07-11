import { BadRequestException } from '@nestjs/common';
import { CommunicationSequelizeRepository } from '../../core/communications/infrastructure/database/sequelize/repositories/communication.repository';

describe('CommunicationsService', () => {
  const transaction = jest.fn((callback: (transaction: object) => unknown) =>
    Promise.resolve(callback({})),
  );
  const communications = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  };
  const categories = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  };
  const tags = { findAll: jest.fn(), findOrCreate: jest.fn() };
  const tagLinks = {
    findAll: jest.fn().mockResolvedValue([]),
    destroy: jest.fn(),
    create: jest.fn(),
  };
  const views = {
    count: jest.fn().mockResolvedValue(0),
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const audits = { create: jest.fn(), findAll: jest.fn() };
  const service = new CommunicationSequelizeRepository(
    { transaction } as never,
    communications as never,
    categories as never,
    tags as never,
    tagLinks as never,
    views as never,
    audits as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('rejects invalid status transitions', async () => {
    communications.findByPk.mockResolvedValue({ id: '1', status: 'published' });
    await expect(
      service.transition('1', 'draft' as never, 'actor'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns active categories ordered by name', async () => {
    categories.findAll.mockResolvedValue([
      { id: '1', name: 'Agenda', slug: 'agenda' },
    ]);
    await expect(service.listCategories()).resolves.toEqual([
      { id: '1', name: 'Agenda', slug: 'agenda' },
    ]);
    expect(categories.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true } }),
    );
  });

  it('returns an empty page when category does not exist', async () => {
    categories.findOne.mockResolvedValue(null);
    await expect(service.list({ category: 'inexistente' })).resolves.toEqual({
      data: [],
      meta: { page: 1, limit: 9, total: 0, totalPages: 0 },
    });
  });
});
