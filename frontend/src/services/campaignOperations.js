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

export function createCampaignLeader(payload) {
  return apiRequest('/campaign-operations/leaders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createCampaignCheckIn(payload) {
  return apiRequest('/campaign-operations/check-ins', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function checkoutCampaignCheckIn(checkInId, payload = {}) {
  return apiRequest(`/campaign-operations/check-ins/${checkInId}/checkout`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function cancelCampaignCheckIn(checkInId) {
  return apiRequest(`/campaign-operations/check-ins/${checkInId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  })
}
