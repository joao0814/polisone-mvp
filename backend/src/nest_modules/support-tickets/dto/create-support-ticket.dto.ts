import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SupportTicketDepartment } from '../../../core/support-tickets/domain/enums/support-ticket-department.enum';
import { SupportTicketPriority } from '../../../core/support-tickets/domain/enums/support-ticket-priority.enum';

export class CreateSupportTicketDto {
  @IsString()
  @MaxLength(255)
  subject: string;

  @IsEnum(SupportTicketDepartment)
  department: SupportTicketDepartment;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subcategory?: string;

  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @IsString()
  @MaxLength(5000)
  message: string;
}
