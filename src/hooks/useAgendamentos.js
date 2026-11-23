import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelarAgendamento,
  concluirAgendamento,
  criarAgendamento,
  listarAgendamentos,
  listarHorariosDisponiveis,
} from '../api/agendamentos'

export function useAgendamentos() {
  return useQuery({
    queryKey: ['agendamentos'],
    queryFn: listarAgendamentos,
  })
}

// Só consulta quando barbeiro e data já foram escolhidos.
export function useHorariosDisponiveis({ barbeiroId, data }) {
  return useQuery({
    queryKey: ['horarios', String(barbeiroId), data],
    queryFn: () => listarHorariosDisponiveis({ barbeiroId, data }),
    enabled: Boolean(barbeiroId && data),
    staleTime: 0,
  })
}

// Depois de qualquer mudança, recarrega a lista e os horários livres.
function useInvalidarAgendamentos() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
    queryClient.invalidateQueries({ queryKey: ['horarios'] })
  }
}

export function useCriarAgendamento() {
  const invalidar = useInvalidarAgendamentos()
  return useMutation({ mutationFn: criarAgendamento, onSuccess: invalidar })
}

export function useCancelarAgendamento() {
  const invalidar = useInvalidarAgendamentos()
  return useMutation({ mutationFn: cancelarAgendamento, onSuccess: invalidar })
}

export function useConcluirAgendamento() {
  const invalidar = useInvalidarAgendamentos()
  return useMutation({ mutationFn: concluirAgendamento, onSuccess: invalidar })
}
