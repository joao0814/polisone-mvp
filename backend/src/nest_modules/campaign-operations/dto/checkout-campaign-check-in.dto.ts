import { IsOptional, IsString } from 'class-validator';

export class CheckoutCampaignCheckInDto {
  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  checkedOutAt?: string;
}
