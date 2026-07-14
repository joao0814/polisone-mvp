import { getCampaignCosts } from './campaignCosts'
import { getTeams, getTeamsSummary } from './teams'

export async function getDashboardContracts() {
  return { source: 'localStorage', mode: 'visual-prototype' }
}

export async function getDailySummary() {
  const { items: teams } = await getTeams()
  return {
    items: {
      events_scheduled: { value: 4 },
      municipalities_visited_today: { value: 6 },
      field_teams_active_now: { value: teams.filter((item) => item.status === 'ACTIVE').length },
      activities_registered_today: { value: 18 },
      new_leaders_today: { value: 3 },
    },
  }
}

export async function getMunicipalityRanking() {
  const { items } = await getTeams()
  const max = Math.max(...items.map((item) => item.members_count), 1)
  return {
    items: items.slice().sort((a, b) => b.members_count - a.members_count).slice(0, 5).map((item) => ({
      name: item.city_name,
      value: Math.round((item.members_count / max) * 100),
    })),
  }
}

export async function getCostRanking(groupBy = 'region') {
  const { items } = await getCampaignCosts()
  const groups = new Map()
  items.forEach((item) => {
    const key = groupBy === 'city' ? item.city_ibge_code : item.region_id
    const label = groupBy === 'city' ? item.city_name : item.region_name
    groups.set(key, { label, amount: (groups.get(key)?.amount ?? 0) + Number(item.amount) })
  })
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0)
  return {
    items: [...groups.values()].sort((a, b) => b.amount - a.amount).slice(0, 5).map((item) => ({
      ...item,
      percent: total ? Math.round((item.amount / total) * 100) : 0,
    })),
  }
}

export async function getRealtimeActivities() {
  const summary = await getTeamsSummary()
  return {
    items: summary.field_teams.slice(0, 4).map((team, index) => ({
      person: team.people[0] ?? team.name,
      time: `0${8 + index}:42`.slice(-5),
      description: `${team.name} registrou atividade em ${team.city}`,
      tag: index % 2 ? 'Visita' : 'Panfletagem',
    })),
  }
}
