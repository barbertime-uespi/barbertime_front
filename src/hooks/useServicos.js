import { useQuery } from '@tanstack/react-query'
import { listarServicos } from '../api/servicos'

export function useServicos() {
  return useQuery({
    queryKey: ['servicos'],
    queryFn: listarServicos,
    staleTime: 1000 * 60, // 1 min
  })
}
