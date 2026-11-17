import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAtualizarPerfil } from '../hooks/usePerfil'
import { parseApiError } from '../api/client'
import { iniciais } from '../utils/format'

export default function Perfil() {
  const { usuario } = useAuth()
  const atualizar = useAtualizarPerfil()

  const [form, setForm] = useState({ nome: '', email: '', telefone: '' })
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  // Preenche o formulário quando o usuário carrega.
  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || '',
        email: usuario.email || '',
        telefone: usuario.telefone || '',
      })
    }
  }, [usuario])

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setSucesso('')
    setErro('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSucesso('')
    setErro('')
    try {
      await atualizar.mutateAsync(form)
      setSucesso('Perfil atualizado com sucesso.')
    } catch (err) {
      setErro(parseApiError(err, 'Não foi possível atualizar o perfil.'))
    }
  }

  if (!usuario) return null

  return (
    <section>
      <div className="page-header">
        <h1>Meu perfil</h1>
        <p>Veja e edite seus dados de contato.</p>
      </div>

      <div className="glass profile-head">
        <div className="avatar">{iniciais(usuario.nome || usuario.username)}</div>
        <div className="who">
          <h2>{usuario.nome || usuario.username}</h2>
          <span className="badge badge-orange" style={{ marginTop: 6 }}>
            {usuario.tipo}
          </span>
        </div>
      </div>

      <form className="glass profile-form" onSubmit={onSubmit}>
        {sucesso && <div className="alert alert-success">{sucesso}</div>}
        {erro && <div className="alert alert-error">{erro}</div>}

        <div className="field">
          <label>Usuário</label>
          <input value={usuario.username} disabled />
        </div>
        <div className="field">
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" value={form.nome} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
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
            required
          />
        </div>

        <button className="btn btn-primary" disabled={atualizar.isPending}>
          {atualizar.isPending ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </section>
  )
}
