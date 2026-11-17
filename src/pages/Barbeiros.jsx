import { useBarbeiros } from '../hooks/useBarbeiros'
import BarbeiroCard from '../components/BarbeiroCard'
import Loader from '../components/Loader'
import { parseApiError } from '../api/client'

export default function Barbeiros() {
  const { data, isLoading, isError, error } = useBarbeiros()

  return (
    <section>
      <div className="page-header">
        <h1>Barbeiros</h1>
        <p>Conheça a equipe de barbeiros disponíveis.</p>
      </div>

      {isLoading && <Loader texto="Carregando barbeiros..." />}

      {isError && (
        <div className="alert alert-error">{parseApiError(error)}</div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <div className="glass empty">Nenhum barbeiro disponível no momento.</div>
      )}

      {!isLoading && !isError && data?.length > 0 && (
        <div className="grid">
          {data.map((barbeiro) => (
            <BarbeiroCard key={barbeiro.id} barbeiro={barbeiro} />
          ))}
        </div>
      )}
    </section>
  )
}
