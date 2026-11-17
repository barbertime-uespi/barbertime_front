import { useQuery } from '@tanstack/react-query'
import { listarBarbeiros } from '../api/barbeiros'

export function useBarbeiros() {
  return useQuery({
    queryKey: ['barbeiros'],
    queryFn: listarBarbeiros,
    staleTime: 1000 * 60, // 1 min
  })
}
