import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
import { ListCommunicationsInput } from '../../domain/contracts/communication.types';
export class ListCommunicationsUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(query: ListCommunicationsInput, admin = false) {
    return this.repository.list(query, admin);
  }
}
