const PREFIX = 'polisone.local.'

export function readLocal(key, fallback) {
  const storageKey = `${PREFIX}${key}`
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    const initial = structuredClone(fallback)
    localStorage.setItem(storageKey, JSON.stringify(initial))
    return initial
  }

  try {
    return JSON.parse(raw)
  } catch {
    const initial = structuredClone(fallback)
    localStorage.setItem(storageKey, JSON.stringify(initial))
    return initial
  }
}

export function writeLocal(key, value) {
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  return value
}

export function createLocalId(prefix = 'item') {
  return `${prefix}-${crypto.randomUUID()}`
}

export function localDelay(value) {
  return Promise.resolve(structuredClone(value))
}
