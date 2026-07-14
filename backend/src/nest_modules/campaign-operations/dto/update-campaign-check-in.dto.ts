import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  CampaignCheckInPersonType,
  CampaignCheckInType,
} from '../campaign-check-in.model';

export class UpdateCampaignCheckInDto {
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @IsEnum(CampaignCheckInPersonType)
  personType?: CampaignCheckInPersonType;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  personName?: string;

  @IsOptional()
  @IsUUID()
  memberId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  cityIbgeCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cityName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @IsOptional()
  @IsEnum(CampaignCheckInType)
  activityType?: CampaignCheckInType;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
