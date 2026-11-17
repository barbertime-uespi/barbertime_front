// Armazenamento centralizado dos tokens JWT.
// Mantido em localStorage para sobreviver a refresh de página.

const ACCESS_KEY = 'barbertime.access'
const REFRESH_KEY = 'barbertime.refresh'

export const tokenStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  setTokens({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  setAccess(access) {
    if (access) localStorage.setItem(ACCESS_KEY, access)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
  hasSession() {
    return Boolean(localStorage.getItem(ACCESS_KEY))
  },
}
