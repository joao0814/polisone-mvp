import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TeamMemberStatus } from '../team-member.model';

export class UpdateTeamMemberDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  name?: string;

  @IsOptional()
  @Matches(/^\+?[\d\s\-()]{8,20}$/)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  role?: string;

  @IsOptional()
  @IsIn(Object.values(TeamMemberStatus))
  status?: TeamMemberStatus;

  @IsOptional()
  @Matches(/^\d{7}$/)
  cityIbgeCode?: string;
}
