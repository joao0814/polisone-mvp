import { apiRequest } from './api'

export function getCampaignCheckIns(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest(`/campaign-operations/check-ins${suffix}`)
}

export function getCampaignActivities() {
  return apiRequest('/campaign-operations/activities')
}

export function getCampaignLeaders() {
  return apiRequest('/campaign-operations/leaders')
}
