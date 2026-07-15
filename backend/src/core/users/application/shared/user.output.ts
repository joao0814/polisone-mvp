import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

export type UserOutput = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
  mustChangePassword: boolean;
  profileImagePath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserOutputMapper {
  static toOutput(user: UserEntity): UserOutput {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      profileImagePath: user.profileImagePath,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
