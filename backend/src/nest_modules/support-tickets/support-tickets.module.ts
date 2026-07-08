import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SupportTicketAttachmentModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket-attachment.model';
import { SupportTicketMessageModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket-message.model';
import { SupportTicketModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket.model';
import { supportTicketsProviders } from './support-tickets.providers';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SupportTicketModel,
      SupportTicketMessageModel,
      SupportTicketAttachmentModel,
    ]),
  ],
  providers: [...supportTicketsProviders],
  exports: [...supportTicketsProviders],
})
export class SupportTicketsModule {}
