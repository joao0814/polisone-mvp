import { createLocalId, localDelay, readLocal, writeLocal } from './localStore'

const seeds = {
  tickets: [],
  calendar: [],
  communications: [],
  banners: [],
}

export async function apiRequest(path, options = {}) {
  const url = new URL(path, 'http://local.polisone')
  const method = (options.method ?? 'GET').toUpperCase()
  const payload = await parseBody(options.body)
  const parts = url.pathname.split('/').filter(Boolean)

  if (parts.includes('support-tickets')) return handleTickets(parts, method, payload, url.searchParams)
  if (parts.includes('calendar-events')) return handleCalendar(parts, method, payload, url.searchParams)
  if (parts.includes('communications')) return handleCommunications(parts, method, payload, url.searchParams)
  if (parts.includes('banners')) return handleBanners(parts, method, payload)
  if (parts.includes('storage')) return null

  throw new Error(`Recurso local nao implementado: ${url.pathname}`)
}

export async function apiRequestBlob() {
  return new Blob()
}

export const authApi = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
}

async function handleTickets(parts, method, payload, params) {
  let items = readLocal('tickets', seeds.tickets)
  const index = parts.indexOf('support-tickets')
  const id = parts[index + 1]
  const action = parts[index + 2]

  if (method === 'GET' && !id) {
    const status = params.get('status')
    const search = (params.get('search') ?? '').toLowerCase()
    const filtered = items.filter((item) => (!status || status === 'all' || item.status === status) && (!search || `${item.title} ${item.description}`.toLowerCase().includes(search)))
    return localDelay({ items: filtered, total: filtered.length, page: 1, totalPages: 1 })
  }
  if (method === 'GET') return localDelay(items.find((item) => item.id === id) ?? null)
  if (method === 'POST' && !id) {
    const ticket = { id: createLocalId('ticket'), protocol: `POL-${Date.now().toString().slice(-6)}`, status: 'OPEN', created_at: new Date().toISOString(), messages: [], ...payload }
    writeLocal('tickets', [...items, ticket])
    return localDelay(ticket)
  }

  const ticket = items.find((item) => item.id === id)
  if (!ticket) throw new Error('Chamado nao encontrado.')
  if (action === 'messages') ticket.messages = [...(ticket.messages ?? []), { id: createLocalId('message'), message: payload.message ?? '', created_at: new Date().toISOString() }]
  else if (action === 'close') ticket.status = 'CLOSED'
  else if (action === 'reopen') ticket.status = 'OPEN'
  else if (action === 'status') ticket.status = payload.status
  else Object.assign(ticket, payload)
  writeLocal('tickets', items)
  return localDelay(ticket)
}

async function handleCalendar(parts, method, payload, params) {
  let items = readLocal('calendar', seeds.calendar)
  const index = parts.indexOf('calendar-events')
  const id = parts[index + 1]

  if (parts.includes('month-markers')) return localDelay({ days: buildMonthMarkers(items, params) })
  if (parts.includes('audit')) return localDelay({ data: [] })
  if (method === 'GET' && !id) return localDelay({ data: items, total: items.length })
  if (method === 'GET') return localDelay(items.find((item) => item.id === id) ?? null)
  if (method === 'POST') {
    const event = { id: createLocalId('event'), status: 'ACTIVE', created_at: new Date().toISOString(), ...payload }
    writeLocal('calendar', [...items, event])
    return localDelay(event)
  }
  if (method === 'DELETE') {
    writeLocal('calendar', items.filter((item) => item.id !== id))
    return localDelay({ success: true })
  }
  const updated = { ...items.find((item) => item.id === id), ...payload }
  writeLocal('calendar', items.map((item) => item.id === id ? updated : item))
  return localDelay(updated)
}

async function handleCommunications(parts, method, payload) {
  let items = readLocal('communications', seeds.communications)
  const index = parts.indexOf('communications')
  const idOrSlug = parts[index + 1]
  const action = parts[index + 2]

  if (parts.includes('categories')) return localDelay([
    { id: 'campaign', name: 'Campanha', slug: 'campanha' },
    { id: 'agenda', name: 'Agenda', slug: 'agenda' },
    { id: 'news', name: 'Noticias', slug: 'noticias' },
  ])
  if (method === 'GET' && !idOrSlug) return localDelay({ data: items, total: items.length })
  if (method === 'GET') return localDelay(items.find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null)
  if (method === 'POST' && action) {
    const item = items.find((entry) => entry.id === idOrSlug)
    if (action === 'publish') item.status = 'PUBLISHED'
    if (action === 'archive') item.status = 'ARCHIVED'
    if (action === 'restore') item.status = 'DRAFT'
    writeLocal('communications', items)
    return localDelay(item)
  }
  if (method === 'POST') {
    const item = { id: createLocalId('communication'), slug: slugify(payload.title), status: 'DRAFT', created_at: new Date().toISOString(), ...payload }
    writeLocal('communications', [...items, item])
    return localDelay(item)
  }
  if (method === 'DELETE') {
    writeLocal('communications', items.filter((item) => item.id !== idOrSlug))
    return localDelay({ success: true })
  }
  const updated = { ...items.find((item) => item.id === idOrSlug), ...payload }
  writeLocal('communications', items.map((item) => item.id === idOrSlug ? updated : item))
  return localDelay(updated)
}

async function handleBanners(parts, method, payload) {
  let items = readLocal('banners', seeds.banners)
  const index = parts.indexOf('banners')
  const id = parts[index + 1]
  const action = parts[index + 2]

  if (method === 'GET' && id === 'active') return localDelay(items.find((item) => item.isActive) ?? null)
  if (method === 'GET' && !id) return localDelay(parts.includes('admin') ? items : items.filter((item) => item.isActive))
  if (method === 'POST') {
    const item = { id: createLocalId('banner'), isActive: true, createdAt: new Date().toISOString(), ...payload, imagePath: payload.image ?? payload.imagePath ?? '' }
    writeLocal('banners', [...items, item])
    return localDelay(item)
  }
  if (method === 'DELETE') {
    writeLocal('banners', items.filter((item) => item.id !== id))
    return localDelay({ success: true })
  }
  const updated = { ...items.find((item) => item.id === id), ...payload, ...(payload.image ? { imagePath: payload.image } : {}), ...(action === 'status' ? { isActive: Boolean(payload.isActive) } : {}) }
  writeLocal('banners', items.map((item) => item.id === id ? updated : item))
  return localDelay(updated)
}

async function parseBody(body) {
  if (!body) return {}
  if (typeof body === 'string') return JSON.parse(body)
  if (body instanceof FormData) {
    const result = {}
    for (const [key, value] of body.entries()) result[key] = value instanceof File ? await fileToDataUrl(value) : value
    return result
  }
  return body
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function buildMonthMarkers(items, params) {
  const year = Number(params.get('year'))
  const month = Number(params.get('month'))
  return items.filter((item) => {
    const date = new Date(item.eventDate ?? item.start_at ?? item.startAt ?? item.date)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  }).map((item) => item.eventDate ?? (item.start_at ?? item.startAt ?? item.date).slice(0, 10))
}

function slugify(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
