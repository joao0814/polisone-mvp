import { IsString, MaxLength } from 'class-validator';

export class AddSupportTicketMessageDto {
  @IsString()
  @MaxLength(5000)
  message: string;
}
