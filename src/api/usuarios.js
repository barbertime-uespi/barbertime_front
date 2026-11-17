import { api } from './client'

// Perfil do usuário logado (US01).

// GET /api/usuarios/perfil/
export async function getPerfil() {
  const { data } = await api.get('/usuarios/perfil/')
  return data
}

// PATCH /api/usuarios/perfil/ — campos editáveis: nome, email, telefone
export async function updatePerfil(payload) {
  const { data } = await api.patch('/usuarios/perfil/', payload)
  return data
}
