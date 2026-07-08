import { IsString, MaxLength } from 'class-validator';

export class SupportTicketActionMessageDto {
  @IsString()
  @MaxLength(5000)
  message: string;
}
