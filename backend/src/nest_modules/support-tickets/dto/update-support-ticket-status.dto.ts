import { IsEnum } from 'class-validator';
import { SupportTicketStatus } from '../../../core/support-tickets/domain/enums/support-ticket-status.enum';

export class UpdateSupportTicketStatusDto {
  @IsEnum(SupportTicketStatus)
  status: SupportTicketStatus;
}
