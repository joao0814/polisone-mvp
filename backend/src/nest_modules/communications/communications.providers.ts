import { Provider } from '@nestjs/common';
import {
  CreateCommunicationUseCase,
  DeleteCommunicationUseCase,
  GetCommunicationAuditUseCase,
  GetCommunicationMetricsUseCase,
  GetCommunicationUseCase,
  ListCommunicationCategoriesUseCase,
  ListCommunicationsUseCase,
  TransitionCommunicationUseCase,
  UpdateCommunicationUseCase,
} from '../../core/communications/application/use_case/communication.use-cases';
import {
  COMMUNICATION_REPOSITORY,
  CommunicationRepository,
} from '../../core/communications/domain/contracts/communication-repository.interface';

export const communicationUseCaseTokens = {
  list: 'LIST_COMMUNICATIONS_USE_CASE',
  get: 'GET_COMMUNICATION_USE_CASE',
  categories: 'LIST_COMMUNICATION_CATEGORIES_USE_CASE',
  create: 'CREATE_COMMUNICATION_USE_CASE',
  update: 'UPDATE_COMMUNICATION_USE_CASE',
  transition: 'TRANSITION_COMMUNICATION_USE_CASE',
  delete: 'DELETE_COMMUNICATION_USE_CASE',
  audit: 'GET_COMMUNICATION_AUDIT_USE_CASE',
  metrics: 'GET_COMMUNICATION_METRICS_USE_CASE',
} as const;
const factory = <T>(
  token: string,
  Type: new (repository: CommunicationRepository) => T,
): Provider => ({
  provide: token,
  inject: [COMMUNICATION_REPOSITORY],
  useFactory: (repository: CommunicationRepository) => new Type(repository),
});
export const communicationProviders: Provider[] = [
  factory(communicationUseCaseTokens.list, ListCommunicationsUseCase),
  factory(communicationUseCaseTokens.get, GetCommunicationUseCase),
  factory(
    communicationUseCaseTokens.categories,
    ListCommunicationCategoriesUseCase,
  ),
  factory(communicationUseCaseTokens.create, CreateCommunicationUseCase),
  factory(communicationUseCaseTokens.update, UpdateCommunicationUseCase),
  factory(
    communicationUseCaseTokens.transition,
    TransitionCommunicationUseCase,
  ),
  factory(communicationUseCaseTokens.delete, DeleteCommunicationUseCase),
  factory(communicationUseCaseTokens.audit, GetCommunicationAuditUseCase),
  factory(communicationUseCaseTokens.metrics, GetCommunicationMetricsUseCase),
];
