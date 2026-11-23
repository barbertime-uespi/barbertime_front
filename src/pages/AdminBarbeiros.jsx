import { useState } from 'react'
import {
  useAtualizarBarbeiro,
  useBarbeirosAdmin,
  useCriarBarbeiro,
  useDesativarBarbeiro,
} from '../hooks/useAdmin'
import { useToast } from '../components/Toast'
import Loader from '../components/Loader'
import { parseApiError } from '../api/client'

const NOVO = { username: '', password: '', nome: '', email: '', telefone: '' }

function FormBarbeiro({ barbeiro, onFechar }) {
  const editando = Boolean(barbeiro)
  const toast = useToast()
  const criar = useCriarBarbeiro()
  const atualizar = useAtualizarBarbeiro()
  const [erro, setErro] = useState('')
  const [form, setForm] = useState(
    editando
      ? { nome: barbeiro.nome, email: barbeiro.email, telefone: barbeiro.telefone }
      : NOVO
  )

  const salvando = criar.isPending || atualizar.isPending

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErro('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      if (editando) {
        await atualizar.mutateAsync({ id: barbeiro.id, payload: form })
        toast.sucesso('Barbeiro atualizado.')
      } else {
        await criar.mutateAsync(form)
        toast.sucesso('Barbeiro cadastrado.')
      }
      onFechar()
    } catch (err) {
      setErro(parseApiError(err, 'Não foi possível salvar o barbeiro.'))
    }
  }

  return (
    <form className="glass form-panel" onSubmit={onSubmit}>
      <h2>{editando ? `Editar ${barbeiro.nome}` : 'Novo barbeiro'}</h2>
      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="form-grid">
        {!editando && (
          <>
            <div className="field">
              <label htmlFor="username">Usuário</label>
              <input id="username" name="username" value={form.username} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">Senha (mín. 6 caracteres)</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={onChange}
                required
              />
            </div>
          </>
        )}
        <div className="field">
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" value={form.nome} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="telefone">Telefone</label>
          <input id="telefone" name="telefone" value={form.telefone} onChange={onChange} required />
        </div>
      </div>

      <div className="row-actions">
        <button className="btn btn-primary" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onFechar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function AdminBarbeiros() {
  const toast = useToast()
  const { data = [], isLoading, isError, error } = useBarbeirosAdmin()
  const atualizar = useAtualizarBarbeiro()
  const desativar = useDesativarBarbeiro()
  const [formAberto, setFormAberto] = useState(null) // null | 'novo' | barbeiro

  async function onDesativar(barbeiro) {
    if (!window.confirm(`Desativar ${barbeiro.nome}? O histórico de agendamentos é mantido.`)) return
    try {
      await desativar.mutateAsync(barbeiro.id)
      toast.sucesso('Barbeiro desativado.')
    } catch (err) {
      toast.erro(parseApiError(err, 'Não foi possível desativar.'))
    }
  }

  async function onReativar(barbeiro) {
    try {
      await atualizar.mutateAsync({ id: barbeiro.id, payload: { ativo: true } })
      toast.sucesso('Barbeiro reativado.')
    } catch (err) {
      toast.erro(parseApiError(err, 'Não foi possível reativar.'))
    }
  }

  return (
    <section>
      <div className="page-header">
        <h1>Gerir barbeiros</h1>
        <p>Cadastre, edite e desative os barbeiros da equipe.</p>
      </div>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setFormAberto('novo')}>
          Novo barbeiro
        </button>
      </div>

      {formAberto && (
        <FormBarbeiro
          key={formAberto === 'novo' ? 'novo' : formAberto.id}
          barbeiro={formAberto === 'novo' ? null : formAberto}
          onFechar={() => setFormAberto(null)}
        />
      )}

      {isLoading && <Loader texto="Carregando barbeiros..." />}
      {isError && <div className="alert alert-error">{parseApiError(error)}</div>}

      {!isLoading && !isError && data.length === 0 && (
        <div className="glass empty">Nenhum barbeiro cadastrado.</div>
      )}

      {!isLoading && !isError && data.length > 0 && (
        <div className="glass table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id}>
                  <td>{b.nome}</td>
                  <td>{b.username}</td>
                  <td>{b.email}</td>
                  <td>{b.telefone}</td>
                  <td>
                    <span className={`badge ${b.ativo ? 'badge-ok' : 'badge-off'}`}>
                      {b.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost" onClick={() => setFormAberto(b)}>
                        Editar
                      </button>
                      {b.ativo ? (
                        <button className="btn btn-ghost btn-danger" onClick={() => onDesativar(b)}>
                          Desativar
                        </button>
                      ) : (
                        <button className="btn btn-ghost" onClick={() => onReativar(b)}>
                          Reativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
