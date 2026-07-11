import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
export class GetCommunicationUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute(slug: string, userId?: string) {
    return this.repository.getPublished(slug, userId);
  }
  executeAdmin(id: string) {
    return this.repository.getAdmin(id);
  }
}
