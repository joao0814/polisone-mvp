import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SupportTicketAttachmentModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket-attachment.model';
import { SupportTicketMessageModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket-message.model';
import { SupportTicketModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket.model';
import { UserModel } from '../../core/users/infrastructure/database/sequelize/models/user.model';
import { SupportTicketsController } from './support-tickets.controller';
import { supportTicketsProviders } from './support-tickets.providers';
import { UserSequelizeRepository } from '../../core/users/infrastructure/database/sequelize/repositories/user.repository';
import { USER_REPOSITORY } from '../../core/users/domain/contracts/user-repository.interface';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      SupportTicketModel,
      SupportTicketMessageModel,
      SupportTicketAttachmentModel,
    ]),
  ],
  controllers: [SupportTicketsController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserSequelizeRepository,
    },
    ...supportTicketsProviders,
  ],
  exports: [...supportTicketsProviders],
})
export class SupportTicketsModule {}
