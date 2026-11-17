import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="hero">
      <div className="glass" style={{ textAlign: 'center' }}>
        <h1>
          <span className="accent">404</span>
        </h1>
        <p style={{ margin: '0 auto 24px' }}>
          Página não encontrada. O endereço pode ter mudado ou não existe.
        </p>
        <Link to="/" className="btn btn-primary">
          Voltar ao início
        </Link>
      </div>
    </section>
  )
}
