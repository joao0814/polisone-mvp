import { createLocalId, localDelay, readLocal, writeLocal } from './localStore'

const KEY = 'campaign-costs'
const initialCosts = [
  { id: 'cost-1', amount: 800000, city_ibge_code: '3550308', city_name: 'Sao Paulo', region_id: 'metropolitana-sp', region_name: 'Regiao metropolitana de SP', notes: 'Material grafico', spent_at: '2026-07-10T12:00:00.000Z' },
  { id: 'cost-2', amount: 520000, city_ibge_code: '3509502', city_name: 'Campinas', region_id: 'campinas', region_name: 'Regiao de Campinas', notes: 'Estrutura de eventos', spent_at: '2026-07-08T12:00:00.000Z' },
  { id: 'cost-3', amount: 310000, city_ibge_code: '3548500', city_name: 'Santos', region_id: 'baixada-santista', region_name: 'Baixada Santista', notes: 'Mobilizacao local', spent_at: '2026-07-05T12:00:00.000Z' },
  { id: 'cost-4', amount: 190000, city_ibge_code: '3543402', city_name: 'Ribeirao Preto', region_id: 'ribeirao-preto', region_name: 'Regiao de Ribeirao Preto', notes: 'Comunicacao regional', spent_at: '2026-07-02T12:00:00.000Z' },
]

export function getCampaignCosts() {
  const items = readLocal(KEY, initialCosts)
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
    city_name: payload.cityName ?? payload.city_name,
    region_id: payload.regionId ?? payload.region_id,
    region_name: payload.regionName ?? payload.region_name,
    notes: payload.notes ?? '',
    spent_at: payload.spentAt ?? payload.spent_at ?? new Date().toISOString(),
  }
}
