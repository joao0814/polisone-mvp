import { createLocalId, localDelay, readLocal, writeLocal } from './localStore'

const KEY = 'campaign-costs'
const initialCosts = [
  { id: 'cost-1', amount: 800000, city_ibge_code: '3550308', city_name: 'São Paulo', region_id: 'metropolitana-sp', region_name: 'Região metropolitana de SP', notes: 'Material gráfico', spent_at: '2026-07-10T12:00:00.000Z' },
  { id: 'cost-2', amount: 520000, city_ibge_code: '3509502', city_name: 'Campinas', region_id: 'campinas', region_name: 'Região de Campinas', notes: 'Estrutura de eventos', spent_at: '2026-07-08T12:00:00.000Z' },
  { id: 'cost-3', amount: 310000, city_ibge_code: '3548500', city_name: 'Santos', region_id: 'baixada-santista', region_name: 'Baixada Santista', notes: 'Mobilizacao local', spent_at: '2026-07-05T12:00:00.000Z' },
  { id: 'cost-4', amount: 190000, city_ibge_code: '3543402', city_name: 'Ribeirão Preto', region_id: 'ribeirao-preto', region_name: 'Região de Ribeirão Preto', notes: 'Comunicação regional', spent_at: '2026-07-02T12:00:00.000Z' },
]

export function getCampaignCosts() {
  const items = readLocal(KEY, initialCosts).map(normalizeCostText)
  return localDelay({ items, total: items.length })
}

export function createCampaignCost(payload) {
  const items = readLocal(KEY, initialCosts)
  const cost = normalize({ id: createLocalId('cost'), ...payload })
  writeLocal(KEY, [...items, cost])
  return localDelay(cost)
}

export function updateCampaignCost(costId, payload) {
  let updated
  const items = readLocal(KEY, initialCosts).map((item) => {
    if (item.id !== costId) return item
    updated = { ...item, ...normalize(payload) }
    return updated
  })
  writeLocal(KEY, items)
  return localDelay(updated)
}

export function deleteCampaignCost(costId) {
  writeLocal(KEY, readLocal(KEY, initialCosts).filter((item) => item.id !== costId))
  return localDelay({ success: true })
}

function normalize(payload) {
  return {
    ...(payload.id ? { id: payload.id } : {}),
    amount: Number(payload.amount),
    city_ibge_code: payload.cityIbgeCode ?? payload.city_ibge_code,
    city_name: fixText(payload.cityName ?? payload.city_name),
    region_id: payload.regionId ?? payload.region_id,
    region_name: fixText(payload.regionName ?? payload.region_name),
    notes: fixText(payload.notes ?? ''),
    spent_at: payload.spentAt ?? payload.spent_at ?? new Date().toISOString(),
  }
}

function normalizeCostText(item) {
  return {
    ...item,
    city_name: fixText(item.city_name),
    region_name: fixText(item.region_name),
    notes: fixText(item.notes),
  }
}

function fixText(value) {
  if (typeof value !== 'string') return value

  return value
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
    .replaceAll('Ãƒ', 'Ã')
}
