import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SupportTicketRepository as SupportTicketRepositoryContract } from '../../../../domain/contracts/support-ticket-repository.interface';
import { SupportTicketEntity } from '../../../../domain/entities/support-ticket.entity';
import { SupportTicketAttachmentModel } from '../models/support-ticket-attachment.model';
import { SupportTicketMessageModel } from '../models/support-ticket-message.model';
import { SupportTicketModel } from '../models/support-ticket.model';
import { SupportTicketModelMapper } from '../models/support-ticket.model.mapper';

@Injectable()
export class SupportTicketSequelizeRepository
  implements SupportTicketRepositoryContract
{
  constructor(
    @InjectModel(SupportTicketModel)
    private readonly supportTicketModel: typeof SupportTicketModel,
  ) {}

  async findById(id: string): Promise<SupportTicketEntity | null> {
    const ticket = await this.supportTicketModel.findByPk(id, {
      include: [
        {
          model: SupportTicketMessageModel,
          include: [SupportTicketAttachmentModel],
        },
      ],
      order: [[SupportTicketMessageModel, 'created_at', 'ASC']],
    });

    return ticket ? SupportTicketModelMapper.toEntity(ticket) : null;
  }

  async store(ticket: SupportTicketEntity): Promise<SupportTicketEntity> {
    const storedTicket = await this.supportTicketModel.create(
      SupportTicketModelMapper.toModel(ticket),
    );

    return SupportTicketModelMapper.toEntity(storedTicket);
  }
}
