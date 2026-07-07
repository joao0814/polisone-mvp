import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserRole } from '../../../../domain/enums/user-role.enum';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class UserModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare name: string;

  @IsEmail
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(180))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare passwordHash: string;

  @AllowNull(false)
  @Default([UserRole.USER])
  @Column(DataType.ARRAY(DataType.STRING))
  declare roles: UserRole[];

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
