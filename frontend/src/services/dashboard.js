import { apiRequest } from './api'

export function getDailySummary() {
  return apiRequest('/dashboard/daily-summary')
}
