import { apiRequest } from './api'

export function getCampaignCosts() {
  return apiRequest('/campaign-costs')
}

export function createCampaignCost(payload) {
  return apiRequest('/campaign-costs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCampaignCost(costId, payload) {
  return apiRequest(`/campaign-costs/${costId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteCampaignCost(costId) {
  return apiRequest(`/campaign-costs/${costId}`, {
    method: 'DELETE',
  })
}
