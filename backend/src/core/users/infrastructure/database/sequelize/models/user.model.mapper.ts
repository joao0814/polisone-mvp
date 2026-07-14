import { UserEntity } from '../../../../domain/entities/user.entity';
import { UserModel } from './user.model';

export class UserModelMapper {
  static toEntity(model: UserModel): UserEntity {
    return UserEntity.create({
      id: model.id,
      name: model.name,
      email: model.email,
      passwordHash: model.passwordHash,
      roles: model.roles,
      isActive: model.isActive,
      profileImagePath: model.profileImagePath,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toModel(user: UserEntity): Partial<UserModel> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      roles: user.roles,
      isActive: user.isActive,
      profileImagePath: user.profileImagePath,
    };
  }
}
