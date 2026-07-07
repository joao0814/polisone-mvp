import { UserOutput } from './user.output';

export type AuthOutput = {
  accessToken: string;
  tokenType: 'Bearer';
  user: UserOutput;
};
