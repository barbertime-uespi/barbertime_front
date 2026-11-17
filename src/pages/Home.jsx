import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { autenticado, usuario } = useAuth()

  return (
    <section className="hero">
      <div className="glass">
        <span className="badge badge-orange">Agendamentos para barbearias</span>
        <h1 style={{ marginTop: 16 }}>
          Sua barbearia organizada, <span className="accent">sem bagunça</span> de
          WhatsApp.
        </h1>
        <p>
          Consulte serviços e barbeiros, gerencie seu perfil e prepare-se para agendar
          seu horário — tudo em um só lugar. A agenda de papel ficou no passado.
        </p>

        <div className="hero-actions">
          <Link to="/servicos" className="btn btn-primary">
            Ver serviços
          </Link>
          <Link to="/barbeiros" className="btn btn-ghost">
            Conhecer barbeiros
          </Link>
          {!autenticado && (
            <Link to="/cadastro" className="btn btn-ghost">
              Criar conta
            </Link>
          )}
        </div>

        {autenticado && (
          <p style={{ marginTop: 24 }} className="text-muted">
            Bem-vindo de volta, <strong className="text-strong">{usuario?.nome}</strong>.
            Seu perfil: <span className="badge badge-orange">{usuario?.tipo}</span>
          </p>
        )}
      </div>
    </section>
  )
}
