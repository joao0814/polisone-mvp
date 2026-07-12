import { apiRequest } from './api'

function queryString(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value != null) query.set(key, value)
  })
  return query.toString()
}

export const listCalendarEvents = (params = {}) =>
  apiRequest(`/calendar-events?${queryString(params)}`)

export const getCalendarEvent = (id) =>
  apiRequest(`/calendar-events/${encodeURIComponent(id)}`)

export const getCalendarEventAudit = (id) =>
  apiRequest(`/admin/calendar-events/${encodeURIComponent(id)}/audit`)

export const listCalendarMonthMarkers = (params) =>
  apiRequest(`/calendar-events/month-markers?${queryString(params)}`)

export const createCalendarEvent = (payload) =>
  apiRequest('/admin/calendar-events', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateCalendarEvent = (id, payload) =>
  apiRequest(`/admin/calendar-events/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const deleteCalendarEvent = (id) =>
  apiRequest(`/admin/calendar-events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
