const AUTH_STORAGE_KEY = 'polisone.auth'
const USERS_STORAGE_KEY = 'polisone.users'

const defaultUser = {
  id: 'local-user',
  name: 'Candidato',
  email: 'candidato@polisone.local',
  role: 'ADMIN',
  profile_image_path: null,
}

export async function login({ email, password }) {
  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail)

  if (user && user.password !== password) {
    throw new Error('E-mail ou senha invalidos.')
  }

  const resolvedUser = user
    ? withoutPassword(user)
    : { ...defaultUser, email: normalizedEmail || defaultUser.email }

  return storeSession(resolvedUser)
}

export async function register({ name, email, password }) {
  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Este e-mail ja esta cadastrado.')
  }

  const user = {
    ...defaultUser,
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, user]))
  return storeSession(withoutPassword(user))
}

export function getStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null

    if (session?.user?.name === 'Candidato Alan Leal') {
      session.user.name = 'Candidato'
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    }

    return session
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function updateStoredUser(user) {
  const session = getStoredSession()
  if (!session) return null

  const nextSession = { ...session, user }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
  return nextSession
}

function storeSession(user) {
  const session = { accessToken: 'local-only', tokenType: 'Local', user }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  return session
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function withoutPassword(storedUser) {
  const user = { ...storedUser }
  delete user.password
  return user
}
