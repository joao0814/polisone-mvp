import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TeamStatus } from '../team.model';

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  name!: string;

  @Matches(/^\d{7}$/)
  cityIbgeCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  cityName!: string;

  @Matches(/^[A-Za-z]{2}$/)
  state!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  coordinatorName?: string;

  @IsOptional()
  @IsIn(Object.values(TeamStatus))
  status?: TeamStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
