import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CampaignLeaderStatus } from '../campaign-leader.model';

export class CreateCampaignLeaderDto {
  @IsString()
  @MaxLength(140)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsString()
  @MaxLength(7)
  cityIbgeCode!: string;

  @IsString()
  @MaxLength(120)
  cityName!: string;

  @IsString()
  @MaxLength(2)
  state!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string | null;

  @IsOptional()
  @IsEnum(CampaignLeaderStatus)
  status?: CampaignLeaderStatus;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @IsUUID()
  teamId?: string | null;
}
