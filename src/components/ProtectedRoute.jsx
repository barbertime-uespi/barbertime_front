import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

// Protege rotas que exigem usuário autenticado.
export default function ProtectedRoute({ children }) {
  const { autenticado, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return <Loader texto="Verificando sessão..." />

  if (!autenticado) {
    // Guarda a origem para voltar após o login.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
