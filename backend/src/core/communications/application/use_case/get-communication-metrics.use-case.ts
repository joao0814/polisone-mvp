import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
export class GetCommunicationMetricsUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(id: string) {
    return this.repository.getMetrics(id);
  }
}
