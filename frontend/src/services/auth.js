const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const AUTH_STORAGE_KEY = 'polisone.auth'

export async function login({ email, password }) {
  return authenticate('/auth/login', { email, password }, 'Nao foi possivel entrar. Verifique seus dados.')
}

export async function register({ name, email, password }) {
  return authenticate('/auth/register', {
    name,
    email,
    password,
  }, 'Nao foi possivel criar a conta. Revise os dados informados.')
}

export function getStoredSession() {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function authenticate(path, payload, fallbackMessage) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await parseJson(response)

  if (!response.ok) {
    throw new Error(resolveApiError(data, fallbackMessage))
  }

  const session = {
    accessToken: data.access_token,
    tokenType: data.token_type,
    user: data.user,
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))

  return session
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
  if (data?.message === 'Invalid credentials') {
    return 'E-mail ou senha inválidos.'
  }

  if (data?.message === 'User email already registered') {
    return 'Este e-mail já está cadastrado.'
  }

  if (Array.isArray(data?.message)) {
    return data.message.join(' ')
  }

  return data?.message ?? fallback
}
