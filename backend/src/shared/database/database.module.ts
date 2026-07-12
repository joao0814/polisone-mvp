import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { SupportTicketAttachmentModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket-attachment.model';
import { SupportTicketMessageModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket-message.model';
import { SupportTicketModel } from '../../core/support-tickets/infrastructure/database/sequelize/models/support-ticket.model';
import { UserModel } from '../../core/users/infrastructure/database/sequelize/models/user.model';
import {
  CommunicationAuditLogModel,
  CommunicationCategoryModel,
  CommunicationModel,
  CommunicationTagLinkModel,
  CommunicationTagModel,
  CommunicationViewModel,
} from '../../core/communications/infrastructure/database/sequelize/models/communication.models';
import { CalendarEventModel } from '../../core/calendar-events/infrastructure/database/sequelize/models/calendar-event.model';
import { CalendarEventAuditLogModel } from '../../core/calendar-events/infrastructure/database/sequelize/models/calendar-event-audit-log.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'polisone'),
        models: [
          UserModel,
          SupportTicketModel,
          SupportTicketMessageModel,
          SupportTicketAttachmentModel,
          CommunicationModel,
          CommunicationCategoryModel,
          CommunicationTagModel,
          CommunicationTagLinkModel,
          CommunicationViewModel,
          CommunicationAuditLogModel,
          CalendarEventModel,
          CalendarEventAuditLogModel,
        ],
        autoLoadModels: true,
        synchronize: configService.get<string>('DB_SYNC', 'false') === 'true',
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
