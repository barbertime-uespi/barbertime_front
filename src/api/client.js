import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Instância principal usada por todo o app.
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Instância "crua" (sem interceptors) para o refresh, evitando loop infinito.
const rawApi = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Request: injeta o access token quando existir.
api.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

// Evita disparar vários refresh ao mesmo tempo: enfileira as chamadas
// que falharam com 401 enquanto o token novo não chega.
let isRefreshing = false
let pendingQueue = []

function resolveQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingQueue = []
}

// Callback opcional chamado quando a sessão expira de vez (refresh falhou).
let onSessionExpired = null
export function setOnSessionExpired(cb) {
  onSessionExpired = cb
}

// Response: em 401, tenta renovar o access via refresh e repete a chamada.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    // Não tenta renovar nas próprias rotas de token nem se já tentou.
    const isAuthRoute =
      original?.url?.includes('/token/') && !original?.url?.includes('/logout/')

    if (status === 401 && !original._retry && !isAuthRoute) {
      const refresh = tokenStorage.getRefresh()
      if (!refresh) {
        tokenStorage.clear()
        onSessionExpired?.()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Aguarda o refresh em andamento.
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await rawApi.post('/token/refresh/', { refresh })
        tokenStorage.setAccess(data.access)
        resolveQueue(null, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch (refreshError) {
        resolveQueue(refreshError, null)
        tokenStorage.clear()
        onSessionExpired?.()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Extrai uma mensagem amigável de erros do DRF.
export function parseApiError(error, fallback = 'Algo deu errado. Tente novamente.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail

  // DRF normalmente devolve { campo: ["msg"] }.
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const value = data[firstKey]
    const msg = Array.isArray(value) ? value[0] : value
    return typeof msg === 'string' ? msg : fallback
  }
  return fallback
}
