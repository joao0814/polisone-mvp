import { CommunicationRepository } from '../../domain/contracts/communication-repository.interface';
export class ListCommunicationCategoriesUseCase {
  constructor(private readonly repository: CommunicationRepository) {}
  execute() {
    return this.repository.listCategories();
  }
}
