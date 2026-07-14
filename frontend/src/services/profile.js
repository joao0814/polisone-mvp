import { getStoredSession, updateStoredUser } from './auth'
import { localDelay, readLocal, writeLocal } from './localStore'

const KEY = 'profile'

export function getProfile() {
  const user = getStoredSession()?.user ?? {}
  return localDelay(readLocal(KEY, {
    ...user,
    campaign: { vote_goal: 120000 },
    phone: '',
    bio: '',
  }))
}

export async function updateProfile(payload) {
  const current = await getProfile()
  const values = payload instanceof FormData ? Object.fromEntries(payload.entries()) : payload
  const next = { ...current, ...values }
  writeLocal(KEY, next)
  updateStoredUser({ ...(getStoredSession()?.user ?? {}), ...next })
  return localDelay(next)
}
