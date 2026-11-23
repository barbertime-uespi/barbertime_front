import { useState } from 'react'
import { useServicos } from '../hooks/useServicos'
import { useBarbeiros } from '../hooks/useBarbeiros'
import {
  useAtualizarServico,
  useCriarServico,
  useDesativarServico,
} from '../hooks/useAdmin'
import { useToast } from '../components/Toast'
import Loader from '../components/Loader'
import { parseApiError } from '../api/client'
import {
  duracaoEmMinutos,
  formatDuracao,
  formatPreco,
  minutosParaDuracao,
} from '../utils/format'

function FormServico({ servico, barbeiros, onFechar }) {
  const editando = Boolean(servico)
  const toast = useToast()
  const criar = useCriarServico()
  const atualizar = useAtualizarServico()
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: servico?.nome ?? '',
    descricao: servico?.descricao ?? '',
    preco: servico?.preco ?? '',
    minutos: servico ? duracaoEmMinutos(servico.duracao) : 30,
    ativo: servico?.ativo ?? true,
    barbeiros: servico?.barbeiros ?? [],
  })

  const salvando = criar.isPending || atualizar.isPending

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErro('')
  }

  function alternarBarbeiro(id) {
    setForm((f) => ({
      ...f,
      barbeiros: f.barbeiros.includes(id)
        ? f.barbeiros.filter((b) => b !== id)
        : [...f.barbeiros, id],
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErro('')
    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: form.preco,
      duracao: minutosParaDuracao(Number(form.minutos)),
      ativo: form.ativo,
      barbeiros: form.barbeiros,
    }
    try {
      if (editando) {
        await atualizar.mutateAsync({ id: servico.id, payload })
        toast.sucesso('Serviço atualizado.')
      } else {
        await criar.mutateAsync(payload)
        toast.sucesso('Serviço cadastrado.')
      }
      onFechar()
    } catch (err) {
      setErro(parseApiError(err, 'Não foi possível salvar o serviço.'))
    }
  }

  return (
    <form className="glass form-panel" onSubmit={onSubmit}>
      <h2>{editando ? `Editar ${servico.nome}` : 'Novo serviço'}</h2>
      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" value={form.nome} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="preco">Preço (R$)</label>
          <input
            id="preco"
            name="preco"
            type="number"
            min="0"
            step="0.01"
            value={form.preco}
            onChange={onChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="minutos">Duração (minutos)</label>
          <input
            id="minutos"
            name="minutos"
            type="number"
            min="5"
            step="5"
            value={form.minutos}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <textarea id="descricao" name="descricao" rows={3} value={form.descricao} onChange={onChange} />
      </div>

      <div className="checks-bloco">
        <span className="horarios-titulo">Barbeiros que realizam este serviço</span>
        {barbeiros.length === 0 ? (
          <p className="text-muted">Nenhum barbeiro ativo cadastrado.</p>
        ) : (
          <div className="checks">
            {barbeiros.map((b) => (
              <label key={b.id} className="check">
                <input
                  type="checkbox"
                  checked={form.barbeiros.includes(b.id)}
                  onChange={() => alternarBarbeiro(b.id)}
                />
                {b.nome}
              </label>
            ))}
          </div>
        )}
      </div>

      <label className="check">
        <input type="checkbox" name="ativo" checked={form.ativo} onChange={onChange} />
        Serviço ativo (visível para os clientes)
      </label>

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

export default function AdminServicos() {
  const toast = useToast()
  // Para o admin, o back também devolve os serviços inativos.
  const { data = [], isLoading, isError, error } = useServicos()
  const { data: barbeiros = [] } = useBarbeiros()
  const atualizar = useAtualizarServico()
  const desativar = useDesativarServico()
  const [formAberto, setFormAberto] = useState(null) // null | 'novo' | servico

  async function onDesativar(servico) {
    if (!window.confirm(`Desativar "${servico.nome}"? O histórico de reservas é mantido.`)) return
    try {
      await desativar.mutateAsync(servico.id)
      toast.sucesso('Serviço desativado.')
    } catch (err) {
      toast.erro(parseApiError(err, 'Não foi possível desativar.'))
    }
  }

  async function onReativar(servico) {
    try {
      await atualizar.mutateAsync({ id: servico.id, payload: { ativo: true } })
      toast.sucesso('Serviço reativado.')
    } catch (err) {
      toast.erro(parseApiError(err, 'Não foi possível reativar.'))
    }
  }

  return (
    <section>
      <div className="page-header">
        <h1>Gerir serviços</h1>
        <p>Cadastre serviços, defina preço e duração e vincule os barbeiros.</p>
      </div>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setFormAberto('novo')}>
          Novo serviço
        </button>
      </div>

      {formAberto && (
        <FormServico
          key={formAberto === 'novo' ? 'novo' : formAberto.id}
          servico={formAberto === 'novo' ? null : formAberto}
          barbeiros={barbeiros}
          onFechar={() => setFormAberto(null)}
        />
      )}

      {isLoading && <Loader texto="Carregando serviços..." />}
      {isError && <div className="alert alert-error">{parseApiError(error)}</div>}

      {!isLoading && !isError && data.length === 0 && (
        <div className="glass empty">Nenhum serviço cadastrado.</div>
      )}

      {!isLoading && !isError && data.length > 0 && (
        <div className="glass table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Preço</th>
                <th>Duração</th>
                <th>Barbeiros</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                  <td>{formatPreco(s.preco)}</td>
                  <td>{formatDuracao(s.duracao)}</td>
                  <td>{s.barbeiros_detalhes?.map((b) => b.nome).join(', ') || '—'}</td>
                  <td>
                    <span className={`badge ${s.ativo ? 'badge-ok' : 'badge-off'}`}>
                      {s.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost" onClick={() => setFormAberto(s)}>
                        Editar
                      </button>
                      {s.ativo ? (
                        <button className="btn btn-ghost btn-danger" onClick={() => onDesativar(s)}>
                          Desativar
                        </button>
                      ) : (
                        <button className="btn btn-ghost" onClick={() => onReativar(s)}>
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
