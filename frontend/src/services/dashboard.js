import { apiRequest } from './api'

export function getDashboardContracts() {
  return apiRequest('/dashboard/contracts')
}

export function getDailySummary() {
  return apiRequest('/dashboard/daily-summary')
}

export function getOverviewMetrics() {
  return apiRequest('/dashboard/overview-metrics')
}

export function getMunicipalityRanking() {
  return apiRequest('/dashboard/municipality-ranking')
}

export function getCostRanking(groupBy = 'region') {
  return apiRequest(`/dashboard/cost-ranking?group_by=${groupBy}`)
}

export function getRealtimeActivities() {
  return apiRequest('/dashboard/realtime-activities')
}

export function getFieldTeamsNow() {
  return apiRequest('/dashboard/field-teams-now')
}
