import { UserRepository } from '../../domain/contracts/user-repository.interface';
import { PasswordHasher } from '../../../../shared/security/password-hasher';
import { UserOutput, UserOutputMapper } from '../shared/user.output';

export type ValidateUserCredentialsInput = {
  email: string;
  password: string;
};

export class ValidateUserCredentialsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: ValidateUserCredentialsInput): Promise<UserOutput> {
    const user = await this.userRepository.findByEmail(
      input.email.toLowerCase().trim(),
    );

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new Error('Invalid credentials');
    }

    return UserOutputMapper.toOutput(user);
  }
}
