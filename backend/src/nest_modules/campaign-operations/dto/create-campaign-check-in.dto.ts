import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CampaignCheckInType } from '../campaign-check-in.model';

export class CreateCampaignCheckInDto {
  @IsOptional()
  @IsUUID()
  teamId?: string | null;

  @IsOptional()
  @IsUUID()
  memberId?: string | null;

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
  @IsEnum(CampaignCheckInType)
  type?: CampaignCheckInType;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  checkedInAt?: string;
}
