import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useAgendamentos,
  useCancelarAgendamento,
  useConcluirAgendamento,
} from '../hooks/useAgendamentos'
import { useServicos } from '../hooks/useServicos'
import { useBarbeiros } from '../hooks/useBarbeiros'
import { useToast } from '../components/Toast'
import AgendamentoCard from '../components/AgendamentoCard'
import Loader from '../components/Loader'
import { parseApiError } from '../api/client'

const TITULOS = {
  cliente: { titulo: 'Meus agendamentos', sub: 'Acompanhe e cancele suas reservas.' },
  barbeiro: { titulo: 'Minha agenda', sub: 'Atendimentos marcados com você.' },
  admin: { titulo: 'Todos os agendamentos', sub: 'Visão geral da barbearia.' },
}

const idDe = (valor) => (valor && typeof valor === 'object' ? valor.id : valor)

// Uma única tela para os três papéis: o back já filtra a lista conforme quem está logado.
export default function Agendamentos() {
  const { usuario } = useAuth()
  const tipo = usuario?.tipo
  const toast = useToast()

  const { data = [], isLoading, isError, error } = useAgendamentos()
  const { data: servicos = [] } = useServicos()
  const { data: barbeiros = [] } = useBarbeiros()
  const cancelar = useCancelarAgendamento()
  const concluir = useConcluirAgendamento()

  const [filtro, setFiltro] = useState('todos')
  const [agindoId, setAgindoId] = useState(null)

  const servicoPorId = useMemo(() => Object.fromEntries(servicos.map((s) => [s.id, s])), [servicos])
  const barbeiroPorId = useMemo(
    () => Object.fromEntries(barbeiros.map((b) => [b.id, b])),
    [barbeiros]
  )

  // Prefere os nomes que o back enviar; senão, procura nas listas públicas.
  function nomesDe(a) {
    return {
      servico:
        a.servico_nome ?? a.servico?.nome ?? servicoPorId[idDe(a.servico)]?.nome ?? `Serviço #${idDe(a.servico)}`,
      barbeiro:
        a.barbeiro_nome ?? a.barbeiro?.nome ?? barbeiroPorId[idDe(a.barbeiro)]?.nome ?? `Barbeiro #${idDe(a.barbeiro)}`,
      cliente: a.cliente_nome ?? a.cliente?.nome ?? `Cliente #${idDe(a.cliente)}`,
    }
  }

  async function executar(mutation, agendamento, mensagem) {
    setAgindoId(agendamento.id)
    try {
      await mutation.mutateAsync(agendamento.id)
      toast.sucesso(mensagem)
    } catch (err) {
      // 403 (sem permissão), 400 (ex.: concluir cancelado), 404...
      toast.erro(parseApiError(err, 'Não foi possível concluir a ação.'))
    } finally {
      setAgindoId(null)
    }
  }

  function onCancelar(agendamento) {
    if (!window.confirm('Cancelar este agendamento?')) return
    executar(cancelar, agendamento, 'Agendamento cancelado.')
  }

  function onConcluir(agendamento) {
    executar(concluir, agendamento, 'Atendimento concluído.')
  }

  const textos = TITULOS[tipo] || TITULOS.cliente
  const lista = filtro === 'todos' ? data : data.filter((a) => a.status === filtro)

  return (
    <section>
      <div className="page-header">
        <h1>{textos.titulo}</h1>
        <p>{textos.sub}</p>
      </div>

      <div className="toolbar">
        <div className="field filtro">
          <label htmlFor="filtro">Status</label>
          <select id="filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="agendado">Agendados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
        {tipo === 'cliente' && (
          <Link to="/agendar" className="btn btn-primary">
            Novo agendamento
          </Link>
        )}
      </div>

      {isLoading && <Loader texto="Carregando agendamentos..." />}

      {isError && <div className="alert alert-error">{parseApiError(error)}</div>}

      {!isLoading && !isError && lista.length === 0 && (
        <div className="glass empty">
          {data.length === 0
            ? 'Nenhum agendamento por aqui ainda.'
            : 'Nenhum agendamento com esse status.'}
        </div>
      )}

      {!isLoading && !isError && lista.length > 0 && (
        <div className="grid">
          {lista.map((a) => {
            const agendado = a.status === 'agendado'
            return (
              <AgendamentoCard
                key={a.id}
                agendamento={a}
                nomes={nomesDe(a)}
                mostrar={{ barbeiro: tipo !== 'barbeiro', cliente: tipo !== 'cliente' }}
                podeCancelar={agendado && (tipo === 'cliente' || tipo === 'admin')}
                podeConcluir={agendado && (tipo === 'barbeiro' || tipo === 'admin')}
                ocupado={agindoId === a.id}
                onCancelar={() => onCancelar(a)}
                onConcluir={() => onConcluir(a)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
