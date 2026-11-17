import { api } from './client'

// Barbeiros — leitura pública (US03 parcial).

// GET /api/barbeiros/ — lista de barbeiros ativos
export async function listarBarbeiros() {
  const { data } = await api.get('/barbeiros/')
  return data
}
