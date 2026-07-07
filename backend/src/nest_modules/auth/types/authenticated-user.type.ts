import { UserRole } from '../../../core/users/domain/enums/user-role.enum';

export type AuthenticatedUser = {
  sub: string;
  email: string;
  roles: UserRole[];
};
