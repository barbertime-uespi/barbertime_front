import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useServicos } from '../hooks/useServicos'
import { useBarbeiros } from '../hooks/useBarbeiros'
import { useCriarAgendamento, useHorariosDisponiveis } from '../hooks/useAgendamentos'
import { useToast } from '../components/Toast'
import Loader from '../components/Loader'
import { parseApiError } from '../api/client'
import {
  duracaoEmMinutos,
  formatData,
  formatDuracao,
  formatPreco,
  hhmmParaMinutos,
  hojeISO,
  minutosParaHHMM,
} from '../utils/format'

// Novo agendamento: serviço -> barbeiro -> data -> horário -> confirmar.
// Aceita pré-seleção por ?servico=ID e/ou ?barbeiro=ID (vindos dos cards).
export default function Agendar() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()

  const { data: servicos = [], isLoading: carregandoServicos } = useServicos()
  const { data: barbeiros = [], isLoading: carregandoBarbeiros } = useBarbeiros()
  const criar = useCriarAgendamento()

  const [servicoId, setServicoId] = useState(params.get('servico') || '')
  const [barbeiroId, setBarbeiroId] = useState(params.get('barbeiro') || '')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [erro, setErro] = useState('')

  const servicosAtivos = servicos.filter((s) => s.ativo)
  const servico = servicosAtivos.find((s) => String(s.id) === String(servicoId))
  const barbeiro = barbeiros.find((b) => String(b.id) === String(barbeiroId))

  // Serviço e barbeiro se filtram entre si (relação N:N do back).
  const servicosOferecidos = barbeiroId
    ? servicosAtivos.filter((s) => s.barbeiros?.includes(Number(barbeiroId)))
    : servicosAtivos
  const barbeirosOferecidos = servico
    ? barbeiros.filter((b) => servico.barbeiros?.includes(b.id))
    : barbeiros

  const dataValida = Boolean(data) && data >= hojeISO()
  const {
    data: livres = [],
    isFetching: carregandoHorarios,
    isError: erroHorarios,
    error: detalheErroHorarios,
  } = useHorariosDisponiveis({
    barbeiroId,
    data: dataValida ? data : '',
  })

  // O back devolve blocos de 30 min. Para serviços mais longos, só oferece o
  // horário se os blocos seguintes também estiverem livres; hoje, descarta horas passadas.
  const duracaoMin = servico ? duracaoEmMinutos(servico.duracao) : 30
  const horarios = useMemo(() => {
    const conjunto = new Set(livres)
    const blocos = Math.ceil(duracaoMin / 30)
    const agora = new Date()
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes()
    return livres.filter((h) => {
      const inicio = hhmmParaMinutos(h)
      for (let i = 1; i < blocos; i++) {
        if (!conjunto.has(minutosParaHHMM(inicio + i * 30))) return false
      }
      if (data === hojeISO() && inicio <= minutosAgora) return false
      return true
    })
  }, [livres, duracaoMin, data])

  function escolherServico(id) {
    setServicoId(id)
    setHorario('')
    setErro('')
    const escolhido = servicosAtivos.find((s) => String(s.id) === String(id))
    if (escolhido && barbeiroId && !escolhido.barbeiros?.includes(Number(barbeiroId))) {
      setBarbeiroId('')
    }
  }

  function escolherBarbeiro(id) {
    setBarbeiroId(id)
    setHorario('')
    setErro('')
  }

  function escolherData(valor) {
    setData(valor)
    setHorario('')
    setErro('')
  }

  async function confirmar(e) {
    e.preventDefault()
    setErro('')
    try {
      await criar.mutateAsync({
        cliente: usuario.id,
        barbeiro: Number(barbeiroId),
        servico: Number(servicoId),
        data,
        horario_inicio: `${horario}:00`,
      })
      toast.sucesso('Agendamento confirmado!')
      navigate('/agendamentos')
    } catch (err) {
      // Ex.: RN01 (barbeiro ocupado) e RN02 (cliente já tem horário nesse intervalo).
      setErro(parseApiError(err, 'Não foi possível criar o agendamento.'))
      setHorario('')
    }
  }

  if (carregandoServicos || carregandoBarbeiros) {
    return <Loader texto="Carregando opções..." />
  }

  const pronto = Boolean(servico && barbeiro && dataValida && horario)

  return (
    <section>
      <div className="page-header">
        <h1>Agendar horário</h1>
        <p>Escolha o serviço, o barbeiro e um horário livre.</p>
      </div>

      <form className="glass form-panel" onSubmit={confirmar}>
        {erro && <div className="alert alert-error">{erro}</div>}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="servico">1. Serviço</label>
            <select
              id="servico"
              value={servicoId}
              onChange={(e) => escolherServico(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {servicosOferecidos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {formatPreco(s.preco)} ({formatDuracao(s.duracao)})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="barbeiro">2. Barbeiro</label>
            <select
              id="barbeiro"
              value={barbeiroId}
              onChange={(e) => escolherBarbeiro(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {barbeirosOferecidos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
            {servico && barbeirosOferecidos.length === 0 && (
              <small className="text-muted">Nenhum barbeiro atende este serviço no momento.</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="data">3. Data</label>
            <input
              id="data"
              type="date"
              min={hojeISO()}
              value={data}
              onChange={(e) => escolherData(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="horarios-bloco">
          <label className="horarios-titulo">4. Horário</label>

          {!barbeiroId || !dataValida ? (
            <p className="text-muted">Escolha o barbeiro e a data para ver os horários livres.</p>
          ) : carregandoHorarios ? (
            <Loader texto="Buscando horários..." />
          ) : erroHorarios ? (
            <div className="alert alert-error">{parseApiError(detalheErroHorarios)}</div>
          ) : horarios.length === 0 ? (
            <p className="text-muted">Nenhum horário livre neste dia. Tente outra data.</p>
          ) : (
            <div className="slots">
              {horarios.map((h) => (
                <button
                  type="button"
                  key={h}
                  className={`slot${horario === h ? ' selected' : ''}`}
                  onClick={() => setHorario(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {pronto && (
          <div className="resumo">
            <strong>{servico.nome}</strong> com <strong>{barbeiro.nome}</strong> em{' '}
            <strong>{formatData(data)}</strong> às <strong>{horario}</strong> —{' '}
            {formatPreco(servico.preco)}
          </div>
        )}

        <button className="btn btn-primary" disabled={!pronto || criar.isPending}>
          {criar.isPending ? 'Agendando...' : 'Confirmar agendamento'}
        </button>
      </form>
    </section>
  )
}
