import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'

export default function Navbar() {
  const { autenticado, usuario, sair } = useAuth()
  const navigate = useNavigate()

  async function handleSair() {
    await sair()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" aria-label="Página inicial">
          <Brand />
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            Início
          </NavLink>
          <NavLink to="/servicos" className="nav-link">
            Serviços
          </NavLink>
          <NavLink to="/barbeiros" className="nav-link">
            Barbeiros
          </NavLink>
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
        </div>
      </div>
    </header>
  )
}
