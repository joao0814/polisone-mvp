import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { CommunicationStatus } from '../../../../domain/enums/communication-status.enum';
import {
  CommunicationAuditLogModel,
  CommunicationCategoryModel,
  CommunicationModel,
  CommunicationTagLinkModel,
  CommunicationTagModel,
  CommunicationViewModel,
} from '../models/communication.models';
import { CommunicationRepository } from '../../../../domain/contracts/communication-repository.interface';
import {
  CreateCommunicationInput,
  ListCommunicationsInput,
  UpdateCommunicationInput,
} from '../../../../domain/contracts/communication.types';

@Injectable()
export class CommunicationSequelizeRepository implements CommunicationRepository {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(CommunicationModel)
    private readonly communications: typeof CommunicationModel,
    @InjectModel(CommunicationCategoryModel)
    private readonly categories: typeof CommunicationCategoryModel,
    @InjectModel(CommunicationTagModel)
    private readonly tags: typeof CommunicationTagModel,
    @InjectModel(CommunicationTagLinkModel)
    private readonly tagLinks: typeof CommunicationTagLinkModel,
    @InjectModel(CommunicationViewModel)
    private readonly views: typeof CommunicationViewModel,
    @InjectModel(CommunicationAuditLogModel)
    private readonly audits: typeof CommunicationAuditLogModel,
  ) {}

  async list(query: ListCommunicationsInput, admin = false) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 9;
    const where: Record<string, unknown> = {};
    if (!admin) where.status = CommunicationStatus.PUBLISHED;
    else if (query.status) where.status = query.status;
    if (query.search)
      where[Op.or as unknown as string] = [
        { title: { [Op.iLike]: `%${query.search}%` } },
        { description: { [Op.iLike]: `%${query.search}%` } },
      ];
    if (query.publishedFrom || query.publishedTo)
      where.publishedAt = {
        ...(query.publishedFrom
          ? { [Op.gte]: new Date(query.publishedFrom) }
          : {}),
        ...(query.publishedTo
          ? { [Op.lte]: new Date(`${query.publishedTo}T23:59:59.999Z`) }
          : {}),
      };
    if (query.category) {
      const category = await this.categories.findOne({
        where: { [Op.or]: [{ id: query.category }, { slug: query.category }] },
      });
      if (!category)
        return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
      where.categoryId = category.id;
    }
    const result = await this.communications.findAndCountAll({
      where,
      order: [
        ['publishedAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      offset: (page - 1) * limit,
      limit,
    });
    const data = await Promise.all(
      result.rows.map((item) => this.present(item)),
    );
    return {
      data,
      meta: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
      },
    };
  }

  async getPublished(slug: string, userId?: string) {
    const item = await this.communications.findOne({
      where: { slug, status: CommunicationStatus.PUBLISHED },
    });
    if (!item) throw new NotFoundException('Communication not found');
    if (userId) await this.registerView(item.id, userId);
    return this.present(item);
  }

  async getAdmin(id: string) {
    const item = await this.find(id);
    return this.present(item);
  }
  async listCategories() {
    return this.categories.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug'],
    });
  }

  async create(dto: CreateCommunicationInput, actorId: string) {
    return this.sequelize.transaction(async (transaction) => {
      await this.assertCategory(dto.categoryId, transaction);
      const item = await this.communications.create(
        {
          title: dto.title.trim(),
          description: dto.description.trim(),
          content: sanitizeHtml(dto.content),
          categoryId: dto.categoryId,
          authorId: actorId,
          slug: await this.uniqueSlug(dto.title, transaction),
          status: CommunicationStatus.DRAFT,
        },
        { transaction },
      );
      await this.syncTags(item.id, dto.tags ?? [], transaction);
      await this.audit(
        item.id,
        actorId,
        'created',
        { status: item.status },
        transaction,
      );
      return this.present(item, transaction);
    });
  }

  async update(id: string, dto: UpdateCommunicationInput, actorId: string) {
    return this.sequelize.transaction(async (transaction) => {
      const item = await this.find(id, transaction);
      if (dto.categoryId)
        await this.assertCategory(dto.categoryId, transaction);
      const changes: Record<string, unknown> = {};
      if (dto.title !== undefined) {
        changes.title = dto.title.trim();
        if (dto.title.trim() !== item.title)
          changes.slug = await this.uniqueSlug(dto.title, transaction, id);
      }
      if (dto.description !== undefined)
        changes.description = dto.description.trim();
      if (dto.content !== undefined)
        changes.content = sanitizeHtml(dto.content);
      if (dto.categoryId !== undefined) changes.categoryId = dto.categoryId;
      await item.update(changes, { transaction });
      if (dto.tags) await this.syncTags(id, dto.tags, transaction);
      await this.audit(id, actorId, 'updated', changes, transaction);
      return this.present(item, transaction);
    });
  }

  async transition(id: string, status: CommunicationStatus, actorId: string) {
    return this.sequelize.transaction(async (transaction) => {
      const item = await this.find(id, transaction);
      const allowed: Record<CommunicationStatus, CommunicationStatus[]> = {
        draft: [CommunicationStatus.PUBLISHED, CommunicationStatus.ARCHIVED],
        published: [CommunicationStatus.ARCHIVED],
        archived: [CommunicationStatus.DRAFT],
      };
      if (!allowed[item.status].includes(status))
        throw new BadRequestException(
          `Invalid transition from ${item.status} to ${status}`,
        );
      await item.update(
        {
          status,
          publishedAt:
            status === CommunicationStatus.PUBLISHED
              ? new Date()
              : item.publishedAt,
        },
        { transaction },
      );
      await this.audit(id, actorId, status, null, transaction);
      return this.present(item, transaction);
    });
  }

  async remove(id: string, actorId: string) {
    const item = await this.find(id);
    await this.audit(id, actorId, 'deleted', null);
    await item.destroy();
  }
  async getAudit(id: string) {
    await this.find(id);
    return this.audits.findAll({
      where: { communicationId: id },
      order: [['createdAt', 'DESC']],
    });
  }
  async getMetrics(id: string) {
    await this.find(id);
    return {
      communicationId: id,
      views: await this.views.count({ where: { communicationId: id } }),
    };
  }

  private async find(id: string, transaction?: Transaction) {
    const item = await this.communications.findByPk(id, { transaction });
    if (!item) throw new NotFoundException('Communication not found');
    return item;
  }
  private async assertCategory(id: string, transaction?: Transaction) {
    if (!(await this.categories.findByPk(id, { transaction })))
      throw new BadRequestException('Category not found');
  }
  private async uniqueSlug(
    title: string,
    transaction?: Transaction,
    ignoreId?: string,
  ) {
    const base = slugify(title) || 'comunicado';
    let slug = base;
    let suffix = 2;
    while (
      await this.communications.findOne({
        where: { slug, ...(ignoreId ? { id: { [Op.ne]: ignoreId } } : {}) },
        paranoid: false,
        transaction,
      })
    )
      slug = `${base}-${suffix++}`;
    return slug;
  }
  private async syncTags(
    communicationId: string,
    names: string[],
    transaction: Transaction,
  ) {
    await this.tagLinks.destroy({ where: { communicationId }, transaction });
    for (const raw of [
      ...new Set(names.map((name) => name.trim()).filter(Boolean)),
    ]) {
      const slug = slugify(raw);
      const [tag] = await this.tags.findOrCreate({
        where: { slug },
        defaults: { name: raw, slug },
        transaction,
      });
      await this.tagLinks.create(
        { communicationId, tagId: tag.id },
        { transaction },
      );
    }
  }
  private async registerView(communicationId: string, userId: string) {
    const since = new Date(Date.now() - 30 * 60 * 1000);
    if (
      !(await this.views.findOne({
        where: { communicationId, userId, createdAt: { [Op.gte]: since } },
      }))
    )
      await this.views.create({ communicationId, userId });
  }
  private async audit(
    communicationId: string,
    actorId: string,
    action: string,
    changes: Record<string, unknown> | null,
    transaction?: Transaction,
  ) {
    await this.audits.create(
      { communicationId, actorId, action, changes },
      { transaction },
    );
  }
  private async present(item: CommunicationModel, transaction?: Transaction) {
    const [category, links, views] = await Promise.all([
      this.categories.findByPk(item.categoryId, {
        transaction,
        attributes: ['id', 'name', 'slug'],
      }),
      this.tagLinks.findAll({
        where: { communicationId: item.id },
        transaction,
      }),
      this.views.count({ where: { communicationId: item.id }, transaction }),
    ]);
    const tagModels = links.length
      ? await this.tags.findAll({
          where: { id: links.map((link) => link.tagId) },
          transaction,
          attributes: ['id', 'name', 'slug'],
        })
      : [];
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      content: item.content,
      status: item.status,
      category,
      authorId: item.authorId,
      tags: tagModels,
      publishedAt: item.publishedAt,
      views,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
function sanitizeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, '')
    .trim();
}
