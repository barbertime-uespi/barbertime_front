import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { parseApiError } from '../api/client'
import Brand from '../components/Brand'

export default function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ username: '', password: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(form)
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(parseApiError(err, 'Usuário ou senha inválidos.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="glass auth-card">
        <Brand />
        <h2>Entrar</h2>
        <p className="subtitle">Acesse sua conta BarberTime</p>

        {erro && <div className="alert alert-error">{erro}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="seu_usuario"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}
