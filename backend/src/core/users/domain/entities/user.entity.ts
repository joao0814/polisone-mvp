import { UserRole } from '../enums/user-role.enum';
import { randomUUID } from 'crypto';

export type UserProps = {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  roles?: UserRole[];
  isActive?: boolean;
  mustChangePassword?: boolean;
  profileImagePath?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class UserEntity {
  private constructor(private readonly props: Required<UserProps>) {}

  static create(props: UserProps): UserEntity {
    const user = new UserEntity({
      id: props.id ?? randomUUID(),
      name: props.name,
      email: props.email.toLowerCase().trim(),
      passwordHash: props.passwordHash,
      roles: props.roles?.length ? props.roles : [UserRole.USER],
      isActive: props.isActive ?? true,
      mustChangePassword: props.mustChangePassword ?? false,
      profileImagePath: props.profileImagePath ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });

    user.validate();
    return user;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get roles(): UserRole[] {
    return [...this.props.roles];
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get profileImagePath(): string | null {
    return this.props.profileImagePath;
  }

  get mustChangePassword(): boolean {
    return this.props.mustChangePassword;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  hasRole(role: UserRole): boolean {
    return this.props.roles.includes(role);
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  updatePassword(passwordHash: string, mustChangePassword = false): void {
    this.props.passwordHash = passwordHash;
    this.props.mustChangePassword = mustChangePassword;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private validate(): void {
    if (!this.props.name.trim()) {
      throw new Error('User name is required');
    }

    if (!/^\S+@\S+\.\S+$/.test(this.props.email)) {
      throw new Error('Valid user email is required');
    }

    if (!this.props.passwordHash) {
      throw new Error('User password hash is required');
    }

    if (!this.props.roles.length) {
      throw new Error('User must have at least one role');
    }
  }
}
