import { apiRequest } from './api'

export async function createTicket(payload) {
  return apiRequest('/support-tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listTickets({ status = 'all', search = '', page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams()

  if (status) {
    params.set('status', status)
  }

  if (search.trim()) {
    params.set('search', search.trim())
  }

  params.set('page', String(page))
  params.set('limit', String(limit))

  return apiRequest(`/support-tickets?${params.toString()}`)
}

export async function getTicketById(id) {
  return apiRequest(`/support-tickets/${id}`)
}

export async function addTicketMessage(id, message) {
  return apiRequest(`/support-tickets/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function updateTicketStatus(id, status) {
  return apiRequest(`/support-tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function closeTicket(id, message) {
  return apiRequest(`/support-tickets/${id}/close`, {
    method: 'PATCH',
    body: JSON.stringify({ message }),
  })
}

export async function reopenTicket(id, message) {
  return apiRequest(`/support-tickets/${id}/reopen`, {
    method: 'PATCH',
    body: JSON.stringify({ message }),
  })
}
