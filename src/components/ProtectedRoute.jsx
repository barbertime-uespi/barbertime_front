import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'
import AcessoNegado from './AcessoNegado'

// Protege rotas que exigem usuário autenticado.
// Com `roles` (ex.: ['admin']), exige também um dos papéis informados (campo `tipo` do perfil).
export default function ProtectedRoute({ children, roles }) {
  const { autenticado, carregando, usuario } = useAuth()
  const location = useLocation()

  if (carregando) return <Loader texto="Verificando sessão..." />

  if (!autenticado) {
    // Guarda a origem para voltar após o login.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(usuario?.tipo)) {
    return <AcessoNegado />
  }

  return children
}
