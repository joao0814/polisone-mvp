import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CalendarEventStatus } from '../../core/calendar-events/domain/enums/calendar-event-status.enum';
import { CalendarEventModel } from '../../core/calendar-events/infrastructure/database/sequelize/models/calendar-event.model';
import { CampaignLeaderModel } from '../campaign-operations/campaign-leader.model';
import { FieldActivityModel } from '../campaign-operations/field-activity.model';
import { CampaignCostModel } from '../campaign-costs/campaign-cost.model';
import { TeamMemberModel } from '../teams/team-member.model';
import { TeamModel } from '../teams/team.model';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly teamsService: TeamsService,
    @InjectModel(FieldActivityModel)
    private readonly fieldActivityModel: typeof FieldActivityModel,
    @InjectModel(CampaignLeaderModel)
    private readonly campaignLeaderModel: typeof CampaignLeaderModel,
    @InjectModel(CampaignCostModel)
    private readonly campaignCostModel: typeof CampaignCostModel,
    @InjectModel(TeamMemberModel)
    private readonly teamMemberModel: typeof TeamMemberModel,
    @InjectModel(CalendarEventModel)
    private readonly calendarEventModel: typeof CalendarEventModel,
    @InjectModel(TeamModel)
    private readonly teamModel: typeof TeamModel,
  ) {}

  async getDailySummary(userId: string) {
    const teamsSummary = await this.teamsService.getSummary(userId);
    const teams = await this.teamsService.list(userId);
    const campaignId = teams.campaign_id;
    const { endOfDay, startOfDay } = getTodayRange();

    const todayKey = toDateKey(new Date());

    const [activities, leaders, scheduledEvents] = await Promise.all([
      this.fieldActivityModel.findAll({
        where: {
          campaignId,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
      }),
      this.campaignLeaderModel.count({
        where: {
          campaignId,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
      }),
      this.calendarEventModel.count({
        where: {
          createdBy: userId,
          eventDate: { [Op.gte]: todayKey },
          status: CalendarEventStatus.ACTIVE,
        },
      }),
    ]);

    const registeredActivitiesCount =
      activities.reduce(
        (accumulator, activity) => accumulator + (activity.quantity ?? 1),
        0,
      ) + leaders;

    return {
      generated_at: new Date().toISOString(),
      scope: 'campaign_dashboard',
      items: {
        events_scheduled: {
          label: 'Eventos',
          value: scheduledEvents,
          period: 'scheduled',
          source_module: 'portal-calendar',
          source_status: 'ready_by_user_calendar',
          calculation_rule:
            'Quantidade de eventos ativos do calendario do portal criados pelo usuario logado com data igual ou posterior a hoje.',
        },
        municipalities_visited_today: {
          label: 'Municipios visitados',
          value: null,
          period: 'today',
          source_module: 'check-in',
          source_status: 'deferred_checkin_scope',
          calculation_rule:
            'Contagem distinta de city_ibge_code nos check-ins do dia.',
        },
        field_teams_active_now: {
          label: 'Equipes em campo',
          value: null,
          period: 'now',
          source_module: 'leader-check-in',
          source_status: 'deferred_checkin_scope',
          calculation_rule:
            'Quantidade de lideres com check-in na janela ativa definida pela campanha.',
          fallback_value: teamsSummary.totals.active_teams,
          fallback_source_module: 'teams',
        },
        activities_registered_today: {
          label: 'Atividades registradas',
          value: registeredActivitiesCount,
          period: 'today',
          source_module: 'field-activities',
          source_status: 'partial_without_checkin',
          calculation_rule:
            'Soma de todos os registros operacionais criados no dia da campanha.',
          data_sources: ['field-activities', 'leaders'],
        },
        new_leaders_today: {
          label: 'Novas liderancas',
          value: leaders,
          period: 'today',
          source_module: 'leaders',
          source_status: 'ready',
          calculation_rule:
            'Quantidade de liderancas cadastradas no dia com base em created_at.',
        },
      },
      readiness: {
        deferred: [
          'municipalities_visited_today',
          'field_teams_active_now',
        ],
        ready_for_aggregation: [
          'activities_registered_today',
        ],
        ready: ['events_scheduled', 'new_leaders_today'],
        fallback_available: ['field_teams_active_now'],
      },
    };
  }

  async getMunicipalityRanking(userId: string) {
    const teams = await this.teamsService.list(userId);
    const cityMap = new Map<
      string,
      { city_name: string; members_count: number; team_count: number }
    >();

    for (const team of teams.items) {
      const current = cityMap.get(team.city_ibge_code) ?? {
        city_name: team.city_name,
        members_count: 0,
        team_count: 0,
      };

      current.team_count += 1;
      current.members_count += team.members_count ?? 0;
      cityMap.set(team.city_ibge_code, current);
    }

    const ranking = [...cityMap.values()]
      .sort(
        (left, right) =>
          right.team_count - left.team_count ||
          right.members_count - left.members_count ||
          left.city_name.localeCompare(right.city_name),
      )
      .slice(0, 5);
    const highestTeamCount = ranking[0]?.team_count ?? 0;

    return {
      generated_at: new Date().toISOString(),
      items: ranking.map((city) => ({
        name: city.city_name,
        team_count: city.team_count,
        members_count: city.members_count,
        value: highestTeamCount
          ? Math.max(8, Math.round((city.team_count / highestTeamCount) * 100))
          : 0,
      })),
    };
  }

  async getCostRanking(userId: string, groupBy: 'region' | 'city' = 'region') {
    const teams = await this.teamsService.list(userId);
    const campaignId = teams.campaign_id;
    const costs = await this.campaignCostModel.findAll({
      where: { campaignId },
      order: [['spentAt', 'DESC']],
    });
    const totalInvested = costs.reduce(
      (accumulator, item) => accumulator + Number(item.amount),
      0,
    );
    const groups = new Map<
      string,
      { amount: number; city_name?: string; region_name?: string }
    >();

    for (const cost of costs) {
      const key = groupBy === 'city' ? cost.cityIbgeCode : cost.regionId;
      const current = groups.get(key) ?? {
        amount: 0,
        city_name: cost.cityName,
        region_name: cost.regionName,
      };

      current.amount += Number(cost.amount);
      groups.set(key, current);
    }

    const items = [...groups.entries()]
      .map(([id, item]) => ({
        id,
        label: groupBy === 'city' ? item.city_name : item.region_name,
        amount: item.amount,
        percent: totalInvested
          ? Math.round((item.amount / totalInvested) * 100)
          : 0,
      }))
      .sort((left, right) => right.amount - left.amount || left.label!.localeCompare(right.label!))
      .slice(0, 5);

    return {
      generated_at: new Date().toISOString(),
      group_by: groupBy,
      total_invested: totalInvested,
      items,
    };
  }

  async getRealtimeActivities(userId: string) {
    const teams = await this.teamsService.list(userId);
    const campaignId = teams.campaign_id;

    const [fieldActivities, leaders, recentTeams, recentMembers] =
      await Promise.all([
        this.fieldActivityModel.findAll({
          where: { campaignId },
          include: [TeamModel, TeamMemberModel],
          order: [['happenedAt', 'DESC']],
          limit: 6,
        }),
        this.campaignLeaderModel.findAll({
          where: { campaignId },
          order: [['createdAt', 'DESC']],
          limit: 6,
        }),
        this.teamModel.findAll({
          where: { campaignId },
          order: [['createdAt', 'DESC']],
          limit: 6,
        }),
        this.teamMemberModel.findAll({
          include: [
            {
              model: TeamModel,
              where: { campaignId },
            },
          ],
          order: [['createdAt', 'DESC']],
          limit: 6,
        }),
      ]);

    const items = [
      ...fieldActivities.map((item) => ({
        description: `${item.member?.name || item.team?.name || 'Equipe'} registrou ${item.activityType.toLowerCase()} em ${item.cityName}`,
        person: item.member?.name || item.team?.name || 'Equipe de campo',
        tag: item.activityType,
        time: formatTime(item.happenedAt ?? item.createdAt),
        timestamp: item.happenedAt ?? item.createdAt,
      })),
      ...leaders.map((item) => ({
        description: `${item.name} foi cadastrada como nova lideranca em ${item.cityName}`,
        person: item.name,
        tag: 'Lideranca',
        time: formatTime(item.createdAt),
        timestamp: item.createdAt,
      })),
      ...recentTeams.map((item) => ({
        description: `${item.name} foi cadastrada para atuar em ${item.cityName}`,
        person: item.coordinatorName || item.name,
        tag: 'Equipe',
        time: formatTime(item.createdAt),
        timestamp: item.createdAt,
      })),
      ...recentMembers.map((item) => ({
        description: `${item.name} entrou para ${item.team?.name || 'a equipe'} em ${item.team?.cityName || 'campo'}`,
        person: item.name,
        tag: 'Membro',
        time: formatTime(item.createdAt),
        timestamp: item.createdAt,
      })),
    ]
      .sort(
        (left, right) =>
          new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
      )
      .slice(0, 8)
      .map(({ timestamp: _timestamp, ...item }) => item);

    return {
      generated_at: new Date().toISOString(),
      items,
    };
  }

  getContracts() {
    return {
      generated_at: new Date().toISOString(),
      scope: 'campaign_dashboard',
      daily_summary: {
        endpoint: '/dashboard/daily-summary',
        items: {
          events_scheduled: {
            label: 'Eventos',
            source_module: 'portal-calendar',
            source_status: 'ready_by_user_calendar',
            period: 'scheduled',
            calculation_rule:
              'Quantidade de eventos ativos do calendario do portal criados pelo usuario logado com data igual ou posterior a hoje.',
          },
          municipalities_visited_today: {
            label: 'Municipios visitados',
            source_module: 'check-in',
            source_status: 'deferred_checkin_scope',
            period: 'today',
            calculation_rule:
              'Contagem distinta de city_ibge_code nos check-ins do dia.',
          },
          field_teams_active_now: {
            label: 'Equipes em campo',
            source_module: 'leader-check-in',
            source_status: 'deferred_checkin_scope',
            period: 'now',
            fallback_source_module: 'teams',
            calculation_rule:
              'Quantidade de lideres com check-in na janela ativa definida pela campanha.',
          },
          activities_registered_today: {
            label: 'Atividades registradas',
            source_module: 'field-activities',
            source_status: 'ready_for_aggregation',
            period: 'today',
            calculation_rule:
              'Soma de todos os registros operacionais criados no dia da campanha.',
          },
          new_leaders_today: {
            label: 'Novas liderancas',
            source_module: 'leaders',
            source_status: 'ready_for_aggregation',
            period: 'today',
            calculation_rule:
              'Quantidade de liderancas cadastradas no dia com base em created_at.',
          },
        },
      },
      municipality_ranking: {
        endpoint: '/dashboard/municipality-ranking',
        label: 'Ranking de municipios',
        source_module: 'teams',
        source_status: 'ready_for_endpoint',
        calculation_rule:
          'Ranking por quantidade de equipes no municipio agrupando por city_ibge_code.',
        tie_breakers: [
          'Maior quantidade de membros',
          'Ordem alfabetica de city_name',
        ],
      },
      cost_ranking: {
        endpoint: '/dashboard/cost-ranking',
        label: 'Custo por regiao',
        source_module: 'campaign-costs',
        source_status: 'pending_module',
        groupings: ['region', 'city'],
        required_fields: [
          'city_ibge_code',
          'city_name',
          'region_id',
          'region_name',
          'amount',
          'notes',
          'spent_at',
        ],
        percentage_rule:
          'Percentual calculado por amount_group / amount_total_invested * 100.',
      },
      realtime_activities: {
        endpoint: '/dashboard/realtime-activities',
        source_modules: ['field-activities', 'leaders', 'teams', 'team-members'],
        source_status: 'ready',
        calculation_rule:
          'Feed ordenado pelos registros mais recentes de atividades de campo, liderancas, equipes e membros da campanha.',
      },
    };
  }
}

function getTodayRange() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

function toDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatTime(value: Date | string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
