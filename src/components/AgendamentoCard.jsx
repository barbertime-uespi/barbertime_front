import { formatData, formatHora } from '../utils/format'

const STATUS = {
  agendado: { label: 'Agendado', classe: 'badge-orange' },
  concluido: { label: 'Concluído', classe: 'badge-ok' },
  cancelado: { label: 'Cancelado', classe: 'badge-off' },
}

export function StatusBadge({ status }) {
  const info = STATUS[status] || { label: status, classe: 'badge-off' }
  return <span className={`badge ${info.classe}`}>{info.label}</span>
}

// Cartão de um agendamento. As ações aparecem conforme as permissões recebidas.
export default function AgendamentoCard({
  agendamento,
  nomes,
  mostrar, // { barbeiro: bool, cliente: bool }
  podeCancelar,
  podeConcluir,
  ocupado,
  onCancelar,
  onConcluir,
}) {
  const { data, horario_inicio, horario_fim, status } = agendamento

  return (
    <article className="glass card agendamento">
      <div className="card-top">
        <h3>{nomes.servico}</h3>
        <StatusBadge status={status} />
      </div>

      <div className="agendamento-quando">
        <strong>{formatData(data)}</strong>
        <span>
          {formatHora(horario_inicio)} – {formatHora(horario_fim)}
        </span>
      </div>

      <div className="agendamento-info">
        {mostrar.barbeiro && <span>Barbeiro: {nomes.barbeiro}</span>}
        {mostrar.cliente && <span>Cliente: {nomes.cliente}</span>}
      </div>

      {(podeCancelar || podeConcluir) && (
        <div className="row-actions">
          {podeConcluir && (
            <button className="btn btn-primary" disabled={ocupado} onClick={onConcluir}>
              Concluir
            </button>
          )}
          {podeCancelar && (
            <button className="btn btn-ghost btn-danger" disabled={ocupado} onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      )}
    </article>
  )
}
