import { formatPreco, formatDuracao } from '../utils/format'

export default function ServicoCard({ servico }) {
  const { nome, descricao, preco, duracao, ativo, barbeiros_detalhes } = servico
  const qtdBarbeiros = barbeiros_detalhes?.length ?? 0

  return (
    <article className="glass card">
      <div className="card-top">
        <h3>{nome}</h3>
        <span className="badge badge-orange">{formatDuracao(duracao)}</span>
      </div>

      <p className="desc">{descricao || 'Sem descrição.'}</p>

      <div className="card-meta">
        <span className="price">{formatPreco(preco)}</span>
        <span className="text-muted" style={{ fontSize: '0.82rem' }}>
          {qtdBarbeiros > 0
            ? `${qtdBarbeiros} barbeiro${qtdBarbeiros > 1 ? 's' : ''}`
            : 'Sem barbeiros'}
        </span>
      </div>

      {!ativo && <span className="badge badge-off">Inativo</span>}
    </article>
  )
}
