import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import {
  CampaignCheckInPersonType,
  CampaignCheckInStatus,
  CampaignCheckInType,
} from '../campaign-check-in.model';

export class ListCampaignCheckInsDto {
  @IsOptional()
  @IsEnum(CampaignCheckInStatus)
  status?: CampaignCheckInStatus;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsEnum(CampaignCheckInPersonType)
  personType?: CampaignCheckInPersonType;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  cityIbgeCode?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(CampaignCheckInType)
  activityType?: CampaignCheckInType;
}
