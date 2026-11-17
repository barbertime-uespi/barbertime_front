import { useServicos } from '../hooks/useServicos'
import ServicoCard from '../components/ServicoCard'
import Loader from '../components/Loader'
import { parseApiError } from '../api/client'

export default function Servicos() {
  const { data, isLoading, isError, error } = useServicos()

  return (
    <section>
      <div className="page-header">
        <h1>Serviços</h1>
        <p>Escolha entre os serviços oferecidos pela barbearia.</p>
      </div>

      {isLoading && <Loader texto="Carregando serviços..." />}

      {isError && (
        <div className="alert alert-error">{parseApiError(error)}</div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <div className="glass empty">Nenhum serviço disponível no momento.</div>
      )}

      {!isLoading && !isError && data?.length > 0 && (
        <div className="grid">
          {data.map((servico) => (
            <ServicoCard key={servico.id} servico={servico} />
          ))}
        </div>
      )}
    </section>
  )
}
