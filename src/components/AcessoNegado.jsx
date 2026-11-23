import { Link } from 'react-router-dom'

export default function AcessoNegado() {
  return (
    <section className="glass empty">
      <h2 className="text-strong">Acesso negado</h2>
      <p style={{ margin: '8px 0 20px' }}>Você não tem permissão para acessar esta página.</p>
      <Link to="/" className="btn btn-primary">
        Voltar ao início
      </Link>
    </section>
  )
}
