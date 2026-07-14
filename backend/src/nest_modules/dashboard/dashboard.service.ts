import { Injectable } from '@nestjs/common';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class DashboardService {
  constructor(private readonly teamsService: TeamsService) {}

  async getDailySummary(userId: string) {
    const teamsSummary = await this.teamsService.getSummary(userId);

    return {
      generated_at: new Date().toISOString(),
      items: {
        events_scheduled: {
          value: null,
          period: 'scheduled',
          source_module: 'calendar-events',
          source_status: 'pending_campaign_dashboard_rule',
        },
        municipalities_visited_today: {
          value: null,
          period: 'today',
          source_module: 'check-in',
          source_status: 'pending_module',
        },
        field_teams_active_now: {
          value: teamsSummary.totals.active_teams,
          period: 'now',
          source_module: 'teams',
          source_status: 'ready',
        },
        activities_registered_today: {
          value: null,
          period: 'today',
          source_module: 'field-activities',
          source_status: 'pending_module',
        },
        new_leaders_today: {
          value: null,
          period: 'today',
          source_module: 'leaders',
          source_status: 'pending_module',
        },
      },
      readiness: {
        pending: [
          'events_scheduled',
          'municipalities_visited_today',
          'activities_registered_today',
          'new_leaders_today',
        ],
        ready: ['field_teams_active_now'],
      },
    };
  }
}
