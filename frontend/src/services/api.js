import { getStoredSession, logout } from './auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function apiRequest(path, options = {}) {
  const session = getStoredSession()
  const headers = new Headers(options.headers ?? {})

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await parseJson(response)

  if (response.status === 401) {
    logout()
  }

  if (!response.ok) {
    throw new Error(resolveApiError(data, 'Nao foi possivel concluir a requisicao.'))
  }

  return data
}

async function parseJson(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function resolveApiError(data, fallback) {
  if (Array.isArray(data?.message)) {
    return data.message.join(' ')
  }

  return data?.message ?? fallback
}
