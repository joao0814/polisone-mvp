import { UserRepository } from '../../domain/contracts/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { PasswordHasher } from '../../../../shared/security/password-hasher';
import { UserOutput, UserOutputMapper } from '../shared/user.output';

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
  roles?: UserRole[];
};

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<UserOutput> {
    const email = input.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error('User email already registered');
    }

    const user = UserEntity.create({
      name: input.name,
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
      roles: input.roles,
    });

    const storedUser = await this.userRepository.store(user);
    return UserOutputMapper.toOutput(storedUser);
  }
}
