// Helpers de formatação alinhados aos contratos da API.

// preco vem como string decimal (ex.: "35.00"). Exibe como BRL.
export function formatPreco(preco) {
  const n = Number(preco)
  if (Number.isNaN(n)) return 'R$ --'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// duracao vem como "HH:MM:SS". Converte para algo legível (ex.: "30 min", "1h 20min").
export function formatDuracao(duracao) {
  if (!duracao || typeof duracao !== 'string') return '--'
  const [hh, mm] = duracao.split(':').map((p) => parseInt(p, 10))
  const horas = Number.isNaN(hh) ? 0 : hh
  const minutos = Number.isNaN(mm) ? 0 : mm
  if (horas === 0 && minutos === 0) return '--'
  const partes = []
  if (horas > 0) partes.push(`${horas}h`)
  if (minutos > 0) partes.push(`${minutos}min`)
  return partes.join(' ')
}

// Iniciais para avatares (ex.: "Roberto Lima" -> "RL").
export function iniciais(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

// ---------------------------------------------------------------------------
// Agendamentos
// ---------------------------------------------------------------------------

const pad = (n) => String(n).padStart(2, '0')

// Data de hoje no fuso local, no formato YYYY-MM-DD (usado em <input type="date">).
export function hojeISO() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// "2026-11-25" -> "25/11/2026" (sem passar por Date, evitando erro de fuso).
export function formatData(iso) {
  if (!iso || typeof iso !== 'string') return '--'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// "09:30:00" -> "09:30"
export function formatHora(hora) {
  return hora ? hora.slice(0, 5) : '--'
}

// "09:30" -> 570
export function hhmmParaMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map((p) => parseInt(p, 10))
  return h * 60 + m
}

// 570 -> "09:30"
export function minutosParaHHMM(min) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
}

// duracao "HH:MM:SS" (DRF) -> minutos. Se vier inválida, assume 30.
export function duracaoEmMinutos(duracao) {
  if (!duracao || typeof duracao !== 'string') return 30
  const [hh, mm] = duracao.split(':').map((p) => parseInt(p, 10))
  const total = (Number.isNaN(hh) ? 0 : hh) * 60 + (Number.isNaN(mm) ? 0 : mm)
  return total > 0 ? total : 30
}

// minutos -> "HH:MM:SS" (formato aceito pelo DurationField do DRF)
export function minutosParaDuracao(min) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}:00`
}
