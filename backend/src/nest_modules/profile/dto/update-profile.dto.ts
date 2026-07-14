import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CampaignStatus } from '../campaign.model';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  campaignName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  candidateName?: string;

  @IsOptional()
  @Matches(/^\d{4}$/)
  electionYear?: string;

  @IsOptional()
  @Matches(/^[A-Za-z]{2}$/)
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  intendedOffice?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  party?: string;

  @IsOptional()
  @IsIn(Object.values(CampaignStatus))
  campaignStatus?: CampaignStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  electionDate?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  voteGoal?: string;
}
