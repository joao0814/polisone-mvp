import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
export class DeleteCommunicationUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(id: string, actorId: string) {
    return this.repository.remove(id, actorId);
  }
}
