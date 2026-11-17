import { api } from './client'

// Serviços — leitura pública (US04).

// GET /api/servicos/ — lista de serviços (visitante/cliente veem só ativos)
export async function listarServicos() {
  const { data } = await api.get('/servicos/')
  return data
}

// GET /api/servicos/{id}/ — detalhe de um serviço
export async function getServico(id) {
  const { data } = await api.get(`/servicos/${id}/`)
  return data
}
