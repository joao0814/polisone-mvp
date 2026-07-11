import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
import { UpdateCommunicationInput } from '../../domain/contracts/communication.types';
export class UpdateCommunicationUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(id: string, input: UpdateCommunicationInput, actorId: string) {
    return this.repository.update(id, input, actorId);
  }
}
