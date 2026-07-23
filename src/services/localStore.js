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
    const parsed = JSON.parse(raw)
    const repaired = repairStoredText(parsed)

    if (JSON.stringify(parsed) !== JSON.stringify(repaired)) {
      localStorage.setItem(storageKey, JSON.stringify(repaired))
    }

    return repaired
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

function repairStoredText(value) {
  if (typeof value === 'string') {
    return value
      .replaceAll('ÃƒÂ£', 'ã')
      .replaceAll('ÃƒÂ¡', 'á')
      .replaceAll('ÃƒÂ¢', 'â')
      .replaceAll('ÃƒÂ©', 'é')
      .replaceAll('ÃƒÂª', 'ê')
      .replaceAll('ÃƒÂ­', 'í')
      .replaceAll('ÃƒÂ³', 'ó')
      .replaceAll('ÃƒÂ´', 'ô')
      .replaceAll('ÃƒÂº', 'ú')
      .replaceAll('ÃƒÂ§', 'ç')
      .replaceAll('ÃƒÂµ', 'õ')
      .replaceAll('Ãƒ ', 'à')
      .replaceAll('Ãƒâ€°', 'É')
      .replaceAll('Ãƒâ€¡', 'Ç')
      .replaceAll('ÃƒÆ’', 'Ã')
      .replaceAll('Ã£', 'ã')
      .replaceAll('Ã¡', 'á')
      .replaceAll('Ã¢', 'â')
      .replaceAll('Ã©', 'é')
      .replaceAll('Ãª', 'ê')
      .replaceAll('Ã­', 'í')
      .replaceAll('Ã³', 'ó')
      .replaceAll('Ã´', 'ô')
      .replaceAll('Ãº', 'ú')
      .replaceAll('Ã§', 'ç')
      .replaceAll('Ãµ', 'õ')
      .replaceAll('Ã ', 'à')
      .replaceAll('Ã‰', 'É')
      .replaceAll('Ã‡', 'Ç')
      .replaceAll('Âº', 'º')
  }

  if (Array.isArray(value)) {
    return value.map(repairStoredText)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, repairStoredText(entryValue)]),
    )
  }

  return value
}
