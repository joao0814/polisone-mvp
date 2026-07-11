import { apiRequest } from './api'
function queryString(params) { const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => { if (value !== '' && value != null) query.set(key, value) }); return query.toString() }
export const listCommunications = (params = {}) => apiRequest(`/communications?${queryString(params)}`)
export const getCommunication = (slug) => apiRequest(`/communications/${encodeURIComponent(slug)}`)
export const listCommunicationCategories = () => apiRequest('/communications/categories')
export const createCommunication = (payload) => apiRequest('/admin/communications', { method: 'POST', body: JSON.stringify(payload) })
export const updateCommunication = (id, payload) => apiRequest(`/admin/communications/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
export const publishCommunication = (id) => apiRequest(`/admin/communications/${id}/publish`, { method: 'POST' })
export const listAdminCommunications = (params = {}) => apiRequest(`/admin/communications?${queryString(params)}`)
export const archiveCommunication = (id) => apiRequest(`/admin/communications/${id}/archive`, { method: 'POST' })
export const restoreCommunication = (id) => apiRequest(`/admin/communications/${id}/restore`, { method: 'POST' })
export const deleteCommunication = (id) => apiRequest(`/admin/communications/${id}`, { method: 'DELETE' })
