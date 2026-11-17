import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout } from '../api/auth'
import { getPerfil } from '../api/usuarios'
import { tokenStorage } from '../api/tokenStorage'
import { setOnSessionExpired } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const limparSessao = useCallback(() => {
    tokenStorage.clear()
    setUsuario(null)
  }, [])

  // Ao montar: se existe sessão salva, busca o perfil para reidratar o usuário.
  useEffect(() => {
    setOnSessionExpired(limparSessao)

    async function reidratar() {
      if (!tokenStorage.hasSession()) {
        setCarregando(false)
        return
      }
      try {
        const perfil = await getPerfil()
        setUsuario(perfil)
      } catch {
        limparSessao()
      } finally {
        setCarregando(false)
      }
    }
    reidratar()
  }, [limparSessao])

  const entrar = useCallback(async ({ username, password }) => {
    const tokens = await apiLogin({ username, password })
    tokenStorage.setTokens(tokens)
    const perfil = await getPerfil()
    setUsuario(perfil)
    return perfil
  }, [])

  const sair = useCallback(async () => {
    const refresh = tokenStorage.getRefresh()
    try {
      if (refresh) await apiLogout(refresh)
    } catch {
      // Mesmo se o logout remoto falhar, limpamos localmente.
    } finally {
      limparSessao()
    }
  }, [limparSessao])

  const value = {
    usuario,
    setUsuario,
    carregando,
    autenticado: Boolean(usuario),
    entrar,
    sair,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
