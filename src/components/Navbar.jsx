import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'

// Links extras por papel do usuário (campo `tipo` do perfil).
const LINKS_POR_PAPEL = {
  cliente: [
    { to: '/agendar', label: 'Agendar' },
    { to: '/agendamentos', label: 'Meus agendamentos' },
  ],
  barbeiro: [{ to: '/agendamentos', label: 'Minha agenda' }],
  admin: [
    { to: '/agendamentos', label: 'Agendamentos' },
    { to: '/admin/barbeiros', label: 'Gerir barbeiros' },
    { to: '/admin/servicos', label: 'Gerir serviços' },
  ],
}

export default function Navbar() {
  const { autenticado, usuario, sair } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [menuAberto, setMenuAberto] = useState(false)

  const linksDoPapel = autenticado ? LINKS_POR_PAPEL[usuario?.tipo] || [] : []

  async function handleSair() {
    await sair()
    queryClient.clear() // não deixa dados do usuário anterior em cache
    setMenuAberto(false)
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" aria-label="Página inicial">
          <Brand />
        </NavLink>

        <nav
          className={`nav-links${menuAberto ? ' open' : ''}`}
          onClick={() => setMenuAberto(false)}
        >
          <NavLink to="/" end className="nav-link">
            Início
          </NavLink>
          <NavLink to="/servicos" className="nav-link">
            Serviços
          </NavLink>
          <NavLink to="/barbeiros" className="nav-link">
            Barbeiros
          </NavLink>
          {linksDoPapel.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link">
              {link.label}
            </NavLink>
          ))}
          {autenticado && (
            <NavLink to="/perfil" className="nav-link">
              Perfil
            </NavLink>
          )}
        </nav>

        <div className="nav-right">
          {autenticado ? (
            <>
              <span className="nav-user">
                Olá, <strong>{usuario?.nome?.split(' ')[0] || usuario?.username}</strong>
              </span>
              <button className="btn btn-ghost" onClick={handleSair}>
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost">
                Entrar
              </NavLink>
              <NavLink to="/cadastro" className="btn btn-primary">
                Criar conta
              </NavLink>
            </>
          )}
          <button
            className="btn btn-ghost nav-toggle"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}
