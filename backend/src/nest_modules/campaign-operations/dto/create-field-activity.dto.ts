import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFieldActivityDto {
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

  @IsString()
  @MaxLength(80)
  activityType!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  happenedAt?: string;
}
