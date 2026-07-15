import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRepository as UserRepositoryContract } from '../../../../domain/contracts/user-repository.interface';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { UserModel } from '../models/user.model';
import { UserModelMapper } from '../models/user.model.mapper';

@Injectable()
export class UserSequelizeRepository implements UserRepositoryContract {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findByPk(id);

    return user ? UserModelMapper.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    return user ? UserModelMapper.toEntity(user) : null;
  }

  async store(user: UserEntity): Promise<UserEntity> {
    const storedUser = await this.userModel.create(
      UserModelMapper.toModel(user),
    );

    return UserModelMapper.toEntity(storedUser);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const current = await this.userModel.findByPk(user.id);

    if (!current) {
      throw new Error('User not found');
    }

    await current.update(UserModelMapper.toModel(user));
    return UserModelMapper.toEntity(current);
  }
}
