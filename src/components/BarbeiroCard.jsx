import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { iniciais } from '../utils/format'

export default function BarbeiroCard({ barbeiro }) {
  const { id, nome, email, telefone, ativo } = barbeiro
  const { autenticado, usuario } = useAuth()
  const podeAgendar = ativo && (!autenticado || usuario?.tipo === 'cliente')

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

      {podeAgendar && (
        <Link to={`/agendar?barbeiro=${id}`} className="btn btn-primary card-cta">
          Agendar com {nome.split(' ')[0]}
        </Link>
      )}
    </article>
  )
}
