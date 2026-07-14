import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCampaignCostDto {
  @IsString()
  @MaxLength(7)
  cityIbgeCode!: string;

  @IsString()
  @MaxLength(120)
  cityName!: string;

  @IsString()
  @MaxLength(80)
  regionId!: string;

  @IsString()
  @MaxLength(120)
  regionName!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  spentAt?: string;
}
