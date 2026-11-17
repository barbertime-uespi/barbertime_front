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
