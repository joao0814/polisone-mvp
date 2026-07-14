import { createLocalId, localDelay, readLocal, writeLocal } from './localStore'

const TEAM_KEY = 'teams'
const MEMBER_KEY = 'team-members'

const initialTeams = [
  { id: 'team-campinas', name: 'Equipe Campinas', city_name: 'Campinas', city_ibge_code: '3509502', state: 'SP', coordinator_name: 'Julia Rocha', status: 'ACTIVE', notes: 'Regiao central', members_count: 4 },
  { id: 'team-sao-paulo', name: 'Equipe Capital', city_name: 'Sao Paulo', city_ibge_code: '3550308', state: 'SP', coordinator_name: 'Marcos Lima', status: 'ACTIVE', notes: 'Zona leste e centro', members_count: 3 },
  { id: 'team-santos', name: 'Equipe Baixada', city_name: 'Santos', city_ibge_code: '3548500', state: 'SP', coordinator_name: 'Camila Reis', status: 'ACTIVE', notes: 'Baixada Santista', members_count: 2 },
  { id: 'team-ribeirao', name: 'Equipe Ribeirao', city_name: 'Ribeirao Preto', city_ibge_code: '3543402', state: 'SP', coordinator_name: 'Rafael Torres', status: 'INACTIVE', notes: 'Em reorganizacao', members_count: 1 },
]

const initialMembers = [
  { id: 'member-1', team_id: 'team-campinas', name: 'Julia Rocha', phone: '(19) 99999-1001', role: 'Coordenadora', status: 'ACTIVE', city_ibge_code: '3509502' },
  { id: 'member-2', team_id: 'team-campinas', name: 'Ana Paula', phone: '(19) 99999-1002', role: 'Mobilizadora', status: 'ACTIVE', city_ibge_code: '3509502' },
  { id: 'member-3', team_id: 'team-campinas', name: 'Daniel Costa', phone: '(19) 99999-1003', role: 'Voluntario', status: 'ACTIVE', city_ibge_code: '3509502' },
  { id: 'member-4', team_id: 'team-campinas', name: 'Paula Nunes', phone: '(19) 99999-1004', role: 'Voluntaria', status: 'INACTIVE', city_ibge_code: '3509502' },
  { id: 'member-5', team_id: 'team-sao-paulo', name: 'Marcos Lima', phone: '(11) 99999-2001', role: 'Coordenador', status: 'ACTIVE', city_ibge_code: '3550308' },
  { id: 'member-6', team_id: 'team-sao-paulo', name: 'Bianca Prado', phone: '(11) 99999-2002', role: 'Mobilizadora', status: 'ACTIVE', city_ibge_code: '3550308' },
  { id: 'member-7', team_id: 'team-sao-paulo', name: 'Igor Ramos', phone: '(11) 99999-2003', role: 'Voluntario', status: 'ACTIVE', city_ibge_code: '3550308' },
  { id: 'member-8', team_id: 'team-santos', name: 'Camila Reis', phone: '(13) 99999-3001', role: 'Coordenadora', status: 'ACTIVE', city_ibge_code: '3548500' },
  { id: 'member-9', team_id: 'team-santos', name: 'Bruna Alves', phone: '(13) 99999-3002', role: 'Voluntaria', status: 'ACTIVE', city_ibge_code: '3548500' },
  { id: 'member-10', team_id: 'team-ribeirao', name: 'Rafael Torres', phone: '(16) 99999-4001', role: 'Coordenador', status: 'INACTIVE', city_ibge_code: '3543402' },
]

export function getTeams() {
  const teams = withMemberCounts(readLocal(TEAM_KEY, initialTeams))
  return localDelay({ items: teams, total: teams.length })
}

export function createTeam(payload) {
  const teams = readLocal(TEAM_KEY, initialTeams)
  const team = toTeam({ id: createLocalId('team'), ...payload })
  writeLocal(TEAM_KEY, [...teams, team])
  return localDelay(team)
}

export function updateTeam(teamId, payload) {
  let updated
  const teams = readLocal(TEAM_KEY, initialTeams).map((team) => {
    if (team.id !== teamId) return team
    updated = { ...team, ...toTeam(payload) }
    return updated
  })
  writeLocal(TEAM_KEY, teams)
  return localDelay(updated)
}

export function getTeamMembers(teamId) {
  const items = readLocal(MEMBER_KEY, initialMembers).filter((item) => item.team_id === teamId)
  return localDelay({ items, total: items.length })
}

export function createTeamMember(teamId, payload) {
  const members = readLocal(MEMBER_KEY, initialMembers)
  const member = { id: createLocalId('member'), team_id: teamId, ...toMember(payload) }
  writeLocal(MEMBER_KEY, [...members, member])
  return localDelay(member)
}

export async function getTeamsSummary() {
  const teams = withMemberCounts(readLocal(TEAM_KEY, initialTeams))
  const members = readLocal(MEMBER_KEY, initialMembers)
  return localDelay({
    metrics: {
      municipalities_active: new Set(teams.filter((item) => item.status === 'ACTIVE').map((item) => item.city_ibge_code)).size,
      leaders: teams.length,
      representatives: members.length,
    },
    field_teams: teams.filter((item) => item.status === 'ACTIVE').map((team) => ({
      id: team.id,
      name: team.name,
      city: team.city_name,
      activities: team.members_count * 3,
      people: members.filter((item) => item.team_id === team.id).map((item) => item.name),
    })),
  })
}

export function getTeamsMap() {
  const teams = withMemberCounts(readLocal(TEAM_KEY, initialTeams))
  const municipalities = teams.map((team) => ({
    city_ibge_code: team.city_ibge_code,
    name: team.city_name,
    team_count: 1,
    members_count: team.members_count,
    tone: resolveTeamTone(team.members_count),
  }))
  return localDelay({ municipalities, regions: [] })
}

function resolveTeamTone(memberCount) {
  if (memberCount >= 4) return 'high'
  if (memberCount >= 3) return 'good'
  if (memberCount >= 2) return 'medium'
  if (memberCount >= 1) return 'low'
  return 'empty'
}

function withMemberCounts(teams) {
  const members = readLocal(MEMBER_KEY, initialMembers)
  return teams.map((team) => ({ ...team, members_count: members.filter((item) => item.team_id === team.id).length }))
}

function toTeam(payload) {
  return {
    ...(payload.id ? { id: payload.id } : {}),
    name: payload.name,
    city_name: payload.cityName ?? payload.city_name,
    city_ibge_code: payload.cityIbgeCode ?? payload.city_ibge_code,
    state: payload.state,
    coordinator_name: payload.coordinatorName ?? payload.coordinator_name,
    status: payload.status,
    notes: payload.notes,
    members_count: payload.members_count ?? 0,
  }
}

function toMember(payload) {
  return {
    name: payload.name,
    phone: payload.phone,
    role: payload.role,
    status: payload.status,
    city_ibge_code: payload.cityIbgeCode ?? payload.city_ibge_code,
  }
}
