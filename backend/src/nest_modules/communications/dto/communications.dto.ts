import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CommunicationStatus } from '../../../core/communications/domain/enums/communication-status.enum';

export class ListCommunicationsDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
  @IsOptional() @IsString() @MaxLength(120) search?: string;
  @IsOptional() @IsString() @MaxLength(120) category?: string;
  @IsOptional() @IsString() publishedFrom?: string;
  @IsOptional() @IsString() publishedTo?: string;
  @IsOptional() @IsEnum(CommunicationStatus) status?: CommunicationStatus;
}

function transformTags({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  try {
    const parsedValue = JSON.parse(value);
    if (Array.isArray(parsedValue)) {
      return parsedValue.map(String);
    }
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}

export class CreateCommunicationDto {
  @IsString() @MinLength(3) @MaxLength(180) title!: string;
  @IsString() @MinLength(3) @MaxLength(500) description!: string;
  @IsString() @MinLength(1) content!: string;
  @IsUUID() categoryId!: string;
  @IsOptional() @Transform(transformTags) @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateCommunicationDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(180) title?: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(500) description?: string;
  @IsOptional() @IsString() @MinLength(1) content?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @Transform(transformTags) @IsArray() @IsString({ each: true }) tags?: string[];
}
