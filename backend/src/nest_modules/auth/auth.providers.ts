import { USER_REPOSITORY } from '../../core/users/domain/contracts/user-repository.interface';
import { UserSequelizeRepository } from '../../core/users/infrastructure/database/sequelize/repositories/user.repository';
import { GetUserByIdUseCase } from '../../core/users/application/use_case/get-user-by-id.use-case';
import { RegisterUserUseCase } from '../../core/users/application/use_case/register-user.use-case';
import { ValidateUserCredentialsUseCase } from '../../core/users/application/use_case/validate-user-credentials.use-case';
import { PasswordHasher } from '../../shared/security/password-hasher';

export const REGISTER_USER_USE_CASE = Symbol('REGISTER_USER_USE_CASE');
export const VALIDATE_USER_CREDENTIALS_USE_CASE = Symbol(
  'VALIDATE_USER_CREDENTIALS_USE_CASE',
);
export const GET_USER_BY_ID_USE_CASE = Symbol('GET_USER_BY_ID_USE_CASE');

export const authProviders = [
  PasswordHasher,
  {
    provide: USER_REPOSITORY,
    useClass: UserSequelizeRepository,
  },
  {
    provide: REGISTER_USER_USE_CASE,
    useFactory: (
      repository: UserSequelizeRepository,
      passwordHasher: PasswordHasher,
    ) => new RegisterUserUseCase(repository, passwordHasher),
    inject: [USER_REPOSITORY, PasswordHasher],
  },
  {
    provide: VALIDATE_USER_CREDENTIALS_USE_CASE,
    useFactory: (
      repository: UserSequelizeRepository,
      passwordHasher: PasswordHasher,
    ) => new ValidateUserCredentialsUseCase(repository, passwordHasher),
    inject: [USER_REPOSITORY, PasswordHasher],
  },
  {
    provide: GET_USER_BY_ID_USE_CASE,
    useFactory: (repository: UserSequelizeRepository) =>
      new GetUserByIdUseCase(repository),
    inject: [USER_REPOSITORY],
  },
];
