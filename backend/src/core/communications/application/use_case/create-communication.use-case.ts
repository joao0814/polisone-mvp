import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
import { CreateCommunicationInput } from '../../domain/contracts/communication.types';
export class CreateCommunicationUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(input: CreateCommunicationInput, actorId: string) {
    return this.repository.create(input, actorId);
  }
}
