import { api } from './client'

// Agendamentos (E3 e E4).

// GET /api/agendamentos/disponiveis/?barbeiro_id=&data=YYYY-MM-DD
// Resposta: { barbeiro_id, data, horarios_disponiveis: ["08:00", "08:30", ...] }
export async function listarHorariosDisponiveis({ barbeiroId, data }) {
  const { data: resposta } = await api.get('/agendamentos/disponiveis/', {
    params: { barbeiro_id: barbeiroId, data },
  })
  return resposta.horarios_disponiveis ?? []
}

// GET /api/agendamentos/ — o back filtra pelo papel (cliente, barbeiro ou admin)
export async function listarAgendamentos() {
  const { data } = await api.get('/agendamentos/')
  return data
}

// POST /api/agendamentos/
// Corpo: { cliente, barbeiro, servico, data: "YYYY-MM-DD", horario_inicio: "HH:MM:SS" }
export async function criarAgendamento(payload) {
  const { data } = await api.post('/agendamentos/', payload)
  return data
}

// PATCH /api/agendamentos/{id}/cancelar/ — cliente dono ou admin
export async function cancelarAgendamento(id) {
  const { data } = await api.patch(`/agendamentos/${id}/cancelar/`)
  return data
}

// PATCH /api/agendamentos/{id}/concluir/ — barbeiro responsável ou admin
export async function concluirAgendamento(id) {
  const { data } = await api.patch(`/agendamentos/${id}/concluir/`)
  return data
}
