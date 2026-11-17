import { api } from './client'

// Endpoints de autenticação (US01, US02).

// POST /api/token/ — login (obter tokens)
export async function login({ username, password }) {
  const { data } = await api.post('/token/', { username, password })
  return data // { access, refresh }
}

// POST /api/usuarios/cadastro/ — cadastro público de cliente
export async function cadastrarCliente(payload) {
  const { data } = await api.post('/usuarios/cadastro/', payload)
  return data
}

// POST /api/token/logout/ — invalida o refresh no servidor (blacklist)
export async function logout(refresh) {
  await api.post('/token/logout/', { refresh })
}
