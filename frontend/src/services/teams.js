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

export function removeTeam(teamId) {
  return apiRequest(`/teams/${teamId}`, { method: 'DELETE' })
}

export function getTeamMembers(teamId) {
  return apiRequest(`/teams/${teamId}/members`)
}

export function createTeamMember(teamId, payload) {
  return apiRequest(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify(payload) })
}

export function updateTeamMember(teamId, memberId, payload) {
  return apiRequest(`/teams/${teamId}/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function removeTeamMember(teamId, memberId) {
  return apiRequest(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' })
}

export function getTeamsSummary() {
  return apiRequest('/teams/summary')
}

export function getTeamsMap() {
  return apiRequest('/teams/map')
}
