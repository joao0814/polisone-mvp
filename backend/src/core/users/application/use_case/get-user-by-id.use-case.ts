import { UserRepository } from '../../domain/contracts/user-repository.interface';
import { UserOutput, UserOutputMapper } from '../shared/user.output';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserOutput> {
    const user = await this.userRepository.findById(id);

    if (!user || !user.isActive) {
      throw new Error('User not found');
    }

    return UserOutputMapper.toOutput(user);
  }
}
