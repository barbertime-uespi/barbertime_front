import { useMutation } from '@tanstack/react-query'
import { updatePerfil } from '../api/usuarios'
import { useAuth } from '../context/AuthContext'

// Atualiza o perfil e sincroniza o usuário no contexto de auth.
export function useAtualizarPerfil() {
  const { setUsuario } = useAuth()

  return useMutation({
    mutationFn: updatePerfil,
    onSuccess: (perfilAtualizado) => {
      setUsuario((anterior) => ({ ...anterior, ...perfilAtualizado }))
    },
  })
}
