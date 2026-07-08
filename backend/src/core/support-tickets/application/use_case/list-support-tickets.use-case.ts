import { UserRole } from '../../../users/domain/enums/user-role.enum';
import {
  SupportTicketListResult,
  SupportTicketRepository,
} from '../../domain/contracts/support-ticket-repository.interface';
import {
  SupportTicketOutput,
  SupportTicketOutputMapper,
} from '../shared/support-ticket.output';

export type ListSupportTicketsInput = {
  currentUserId: string;
  currentUserRoles: UserRole[];
  status?: 'open' | 'closed' | 'all';
  search?: string;
  page?: number;
  limit?: number;
};

export type ListSupportTicketsOutput = {
  items: SupportTicketOutput[];
  total: number;
  page: number;
  limit: number;
};

export class ListSupportTicketsUseCase {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
  ) {}

  async execute(
    input: ListSupportTicketsInput,
  ): Promise<ListSupportTicketsOutput> {
    const canViewAll =
      input.currentUserRoles.includes(UserRole.ADMIN) ||
      input.currentUserRoles.includes(UserRole.MANAGER);

    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 20));
    const filters = {
      requesterId: canViewAll ? undefined : input.currentUserId,
      includeClosed: input.status === 'all',
      onlyClosed: input.status === 'closed',
      search: input.search?.trim(),
      page,
      limit,
    };

    const result: SupportTicketListResult =
      await this.supportTicketRepository.findMany(filters);

    return {
      items: result.items.map((item) => SupportTicketOutputMapper.toOutput(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
