import { iniciais } from '../utils/format'

export default function BarbeiroCard({ barbeiro }) {
  const { nome, email, telefone, ativo } = barbeiro

  return (
    <article className="glass card">
      <div className="person">
        <div className="avatar">{iniciais(nome)}</div>
        <div className="info">
          <span className="name">{nome}</span>
          <span className="sub">{email}</span>
          <span className="sub">{telefone}</span>
        </div>
      </div>
      <div className="card-meta">
        {ativo ? (
          <span className="badge badge-ok">Ativo</span>
        ) : (
          <span className="badge badge-off">Inativo</span>
        )}
      </div>
    </article>
  )
}
