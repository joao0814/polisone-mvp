import { apiRequest } from './api'

export function getTeams() {
  return apiRequest('/teams')
}

export function createTeam(payload) {
  return apiRequest('/teams', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateTeam(teamId, payload) {
  return apiRequest(`/teams/${teamId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function getTeamMembers(teamId) {
  return apiRequest(`/teams/${teamId}/members`)
}

export function createTeamMember(teamId, payload) {
  return apiRequest(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify(payload) })
}

export function getTeamsSummary() {
  return apiRequest('/teams/summary')
}

export function getTeamsMap() {
  return apiRequest('/teams/map')
}
