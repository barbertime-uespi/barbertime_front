import { api } from './client'

// Área administrativa: barbeiros (US03) e serviços (US04), escrita só para admin.

// ---- Barbeiros: /api/admin/barbeiros/ (DELETE = desativação lógica) ----
export async function listarBarbeirosAdmin() {
  const { data } = await api.get('/admin/barbeiros/')
  return data
}

export async function criarBarbeiro(payload) {
  const { data } = await api.post('/admin/barbeiros/', payload)
  return data
}

export async function atualizarBarbeiro(id, payload) {
  const { data } = await api.patch(`/admin/barbeiros/${id}/`, payload)
  return data
}

export async function desativarBarbeiro(id) {
  await api.delete(`/admin/barbeiros/${id}/`)
}

// ---- Serviços: /api/servicos/ (DELETE = desativação lógica) ----
export async function criarServico(payload) {
  const { data } = await api.post('/servicos/', payload)
  return data
}

export async function atualizarServico(id, payload) {
  const { data } = await api.patch(`/servicos/${id}/`, payload)
  return data
}

export async function desativarServico(id) {
  await api.delete(`/servicos/${id}/`)
}
