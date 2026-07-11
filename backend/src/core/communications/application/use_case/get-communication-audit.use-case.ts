import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
export class GetCommunicationAuditUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(id: string) {
    return this.repository.getAudit(id);
  }
}
