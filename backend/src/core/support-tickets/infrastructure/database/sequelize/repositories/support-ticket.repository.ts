import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  SupportTicketListFilters,
  SupportTicketListResult,
  SupportTicketRepository as SupportTicketRepositoryContract,
} from '../../../../domain/contracts/support-ticket-repository.interface';
import { SupportTicketMessageEntity } from '../../../../domain/entities/support-ticket-message.entity';
import { SupportTicketEntity } from '../../../../domain/entities/support-ticket.entity';
import { SupportTicketStatus } from '../../../../domain/enums/support-ticket-status.enum';
import { SupportTicketAttachmentModel } from '../models/support-ticket-attachment.model';
import { SupportTicketMessageModel } from '../models/support-ticket-message.model';
import { SupportTicketModel } from '../models/support-ticket.model';
import { SupportTicketModelMapper } from '../models/support-ticket.model.mapper';
import { FindOptions, Op, WhereOptions } from 'sequelize';

@Injectable()
export class SupportTicketSequelizeRepository
  implements SupportTicketRepositoryContract
{
  constructor(
    @InjectModel(SupportTicketModel)
    private readonly supportTicketModel: typeof SupportTicketModel,
  ) {}

  async findById(id: string): Promise<SupportTicketEntity | null> {
    const ticket = await this.supportTicketModel.findByPk(id, this.buildFindOptions());

    return ticket ? SupportTicketModelMapper.toEntity(ticket) : null;
  }

  async findByProtocol(protocol: string): Promise<SupportTicketEntity | null> {
    const ticket = await this.supportTicketModel.findOne({
      where: { protocol },
    });

    return ticket ? SupportTicketModelMapper.toEntity(ticket) : null;
  }

  async findMany(
    filters: SupportTicketListFilters,
  ): Promise<SupportTicketListResult> {
    const where = this.buildListWhereClause(filters);
    const offset = (filters.page - 1) * filters.limit;
    const { rows, count } = await this.supportTicketModel.findAndCountAll({
      where,
      limit: filters.limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      items: rows.map((item) => SupportTicketModelMapper.toEntity(item)),
      total: count,
      page: filters.page,
      limit: filters.limit,
    };
  }

  async store(ticket: SupportTicketEntity): Promise<SupportTicketEntity> {
    const storedTicket = await this.supportTicketModel.create(
      SupportTicketModelMapper.toModel(ticket),
    );

    return SupportTicketModelMapper.toEntity(storedTicket);
  }

  async addMessage(
    message: SupportTicketMessageEntity,
  ): Promise<SupportTicketMessageEntity> {
    const storedMessage = await SupportTicketMessageModel.create({
      id: message.id,
      ticketId: message.ticketId,
      senderId: message.senderId,
      message: message.message,
      type: message.type,
    });

    return SupportTicketModelMapper.messageToEntity(storedMessage);
  }

  async updateStatus(
    id: string,
    status: SupportTicketStatus,
    closedAt: Date | null = null,
  ): Promise<SupportTicketEntity | null> {
    await this.supportTicketModel.update(
      {
        status,
        closedAt,
      },
      {
        where: { id },
      },
    );

    return this.findById(id);
  }

  private buildFindOptions(): Omit<FindOptions<SupportTicketModel>, 'where'> {
    return {
      include: [
        {
          model: SupportTicketMessageModel,
          include: [SupportTicketAttachmentModel],
        },
      ],
      order: [[SupportTicketMessageModel, 'created_at', 'ASC']],
    };
  }

  private buildListWhereClause(
    filters: SupportTicketListFilters,
  ): WhereOptions<SupportTicketModel> {
    const where: WhereOptions<SupportTicketModel> = {};

    if (filters.requesterId) {
      where.requesterId = filters.requesterId;
    }

    if (filters.onlyClosed) {
      where.status = SupportTicketStatus.CLOSED;
    } else if (!filters.includeClosed) {
      where.status = {
        [Op.ne]: SupportTicketStatus.CLOSED,
      };
    }

    if (filters.search) {
      where[Op.or] = [
        {
          subject: {
            [Op.iLike]: `%${filters.search}%`,
          },
        },
        {
          protocol: {
            [Op.iLike]: `%${filters.search}%`,
          },
        },
      ];
    }

    return where;
  }
}
