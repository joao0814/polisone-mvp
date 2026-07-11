import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
import { CommunicationStatus } from '../../domain/enums/communication-status.enum';
export class TransitionCommunicationUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(id: string, status: CommunicationStatus, actorId: string) {
    return this.repository.transition(id, status, actorId);
  }
}
