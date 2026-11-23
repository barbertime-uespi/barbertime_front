import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarBarbeiro,
  atualizarServico,
  criarBarbeiro,
  criarServico,
  desativarBarbeiro,
  desativarServico,
  listarBarbeirosAdmin,
} from '../api/admin'

export function useBarbeirosAdmin() {
  return useQuery({ queryKey: ['admin', 'barbeiros'], queryFn: listarBarbeirosAdmin })
}

// Cria uma mutation que, ao terminar, recarrega as listas indicadas.
function useMutationInvalidando(mutationFn, chaves) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      chaves.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    },
  })
}

const CHAVES_BARBEIROS = [['admin', 'barbeiros'], ['barbeiros'], ['servicos']]
const CHAVES_SERVICOS = [['servicos']]

export const useCriarBarbeiro = () =>
  useMutationInvalidando(criarBarbeiro, CHAVES_BARBEIROS)

export const useAtualizarBarbeiro = () =>
  useMutationInvalidando(({ id, payload }) => atualizarBarbeiro(id, payload), CHAVES_BARBEIROS)

export const useDesativarBarbeiro = () =>
  useMutationInvalidando(desativarBarbeiro, CHAVES_BARBEIROS)

export const useCriarServico = () => useMutationInvalidando(criarServico, CHAVES_SERVICOS)

export const useAtualizarServico = () =>
  useMutationInvalidando(({ id, payload }) => atualizarServico(id, payload), CHAVES_SERVICOS)

export const useDesativarServico = () =>
  useMutationInvalidando(desativarServico, CHAVES_SERVICOS)
