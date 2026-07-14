import { apiRequest } from './api'

export function getProfile() {
  return apiRequest('/profile')
}

export function updateProfile(payload) {
  return apiRequest('/profile', { method: 'PATCH', body: payload })
}
