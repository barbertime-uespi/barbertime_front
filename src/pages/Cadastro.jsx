import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cadastrarCliente } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { parseApiError } from '../api/client'
import Brand from '../components/Brand'

const INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  username: '',
  password: '',
}

export default function Cadastro() {
  const { entrar } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(INICIAL)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErro('')

    if (form.password.length < 6) {
      setErro('A senha deve ter ao menos 6 caracteres.')
      return
    }

    setEnviando(true)
    try {
      await cadastrarCliente(form)
      // Após cadastrar, já loga o cliente automaticamente.
      await entrar({ username: form.username, password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setErro(parseApiError(err, 'Não foi possível concluir o cadastro.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="glass auth-card">
        <Brand />
        <h2>Criar conta</h2>
        <p className="subtitle">Cadastre-se como cliente</p>

        {erro && <div className="alert alert-error">{erro}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              name="nome"
              value={form.nome}
              onChange={onChange}
              placeholder="Carlos Silva"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="carlos@exemplo.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              value={form.telefone}
              onChange={onChange}
              placeholder="86999998888"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="carlos"
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
              placeholder="mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
