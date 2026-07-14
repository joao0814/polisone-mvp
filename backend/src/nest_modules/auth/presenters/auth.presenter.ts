import { AuthOutput } from '../../../core/users/application/shared/auth.output';
import { UserOutput } from '../../../core/users/application/shared/user.output';

export class AuthPresenter {
  static toHTTP(output: AuthOutput) {
    return {
      access_token: output.accessToken,
      token_type: output.tokenType,
      user: AuthPresenter.userToHTTP(output.user),
    };
  }

  static userToHTTP(user: UserOutput) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      is_active: user.isActive,
      profile_image_path: user.profileImagePath,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
