import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  CommunicationAuditLogModel,
  CommunicationCategoryModel,
  CommunicationModel,
  CommunicationTagLinkModel,
  CommunicationTagModel,
  CommunicationViewModel,
} from '../../core/communications/infrastructure/database/sequelize/models/communication.models';
import { AuthModule } from '../auth/auth.module';
import {
  AdminCommunicationsController,
  CommunicationsController,
} from './communications.controller';
import { COMMUNICATION_REPOSITORY } from '../../core/communications/domain/contracts/communication-repository.interface';
import { CommunicationSequelizeRepository } from '../../core/communications/infrastructure/database/sequelize/repositories/communication.repository';
import { communicationProviders } from './communications.providers';
import { StorageModule } from '../storage/storage.module';

export const communicationModels = [
  CommunicationModel,
  CommunicationCategoryModel,
  CommunicationTagModel,
  CommunicationTagLinkModel,
  CommunicationViewModel,
  CommunicationAuditLogModel,
];

@Module({
  imports: [AuthModule, StorageModule, SequelizeModule.forFeature(communicationModels)],
  controllers: [CommunicationsController, AdminCommunicationsController],
  providers: [
    CommunicationSequelizeRepository,
    {
      provide: COMMUNICATION_REPOSITORY,
      useExisting: CommunicationSequelizeRepository,
    },
    ...communicationProviders,
  ],
  exports: [...communicationProviders],
})
export class CommunicationsModule {}
