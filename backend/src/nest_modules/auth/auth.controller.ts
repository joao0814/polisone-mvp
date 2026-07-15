import {
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSequelizeRepository } from '../../core/users/infrastructure/database/sequelize/repositories/user.repository';
import { USER_REPOSITORY } from '../../core/users/domain/contracts/user-repository.interface';
import { UserRole } from '../../core/users/domain/enums/user-role.enum';
import { GetUserByIdUseCase } from '../../core/users/application/use_case/get-user-by-id.use-case';
import { RegisterUserUseCase } from '../../core/users/application/use_case/register-user.use-case';
import { ValidateUserCredentialsUseCase } from '../../core/users/application/use_case/validate-user-credentials.use-case';
import { UserOutput } from '../../core/users/application/shared/user.output';
import { PasswordHasher } from '../../shared/security/password-hasher';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthPresenter } from './presenters/auth.presenter';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import {
  GET_USER_BY_ID_USE_CASE,
  REGISTER_USER_USE_CASE,
  VALIDATE_USER_CREDENTIALS_USE_CASE,
} from './auth.providers';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(REGISTER_USER_USE_CASE)
    private readonly registerUserUseCase: RegisterUserUseCase,
    @Inject(VALIDATE_USER_CREDENTIALS_USE_CASE)
    private readonly validateUserCredentialsUseCase: ValidateUserCredentialsUseCase,
    @Inject(GET_USER_BY_ID_USE_CASE)
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserSequelizeRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    try {
      const user = await this.registerUserUseCase.execute(dto);

      return AuthPresenter.toHTTP({
        accessToken: await this.signAccessToken(user),
        tokenType: 'Bearer',
        user,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'User email already registered'
      ) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const user = await this.validateUserCredentialsUseCase.execute(dto);

      return AuthPresenter.toHTTP({
        accessToken: await this.signAccessToken(user),
        tokenType: 'Bearer',
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    try {
      const user = await this.getUserByIdUseCase.execute(currentUser.sub);

      return AuthPresenter.userToHTTP(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Get('admin-check')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  adminCheck(@CurrentUser() currentUser: AuthenticatedUser) {
    return {
      ok: true,
      user_id: currentUser.sub,
      required_role: UserRole.ADMIN,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.userRepository.findById(currentUser.sub);

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    if (!user.mustChangePassword) {
      if (!dto.currentPassword) {
        throw new UnauthorizedException('Current password is required');
      }

      const passwordMatches = await this.passwordHasher.compare(
        dto.currentPassword,
        user.passwordHash,
      );

      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    user.updatePassword(
      await this.passwordHasher.hash(dto.newPassword),
      false,
    );

    const updatedUser = await this.userRepository.update(user);
    return AuthPresenter.userToHTTP(updatedUser);
  }

  private signAccessToken(user: UserOutput): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
  }
}
