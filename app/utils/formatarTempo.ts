/**
 * Formata uma data em tempo relativo
 * @param data - A data a ser formatada
 * @returns String com tempo relativo (ex: "2m", "1h", "3d")
 */
export function formatarTempoRelativo(data: Date): string {
  try {
    const agora = new Date()
    const diff = Math.floor((agora.getTime() - data.getTime()) / 1000)

    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`

    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

/**
 * Formata uma data em formato pt-BR
 * @param data - A data a ser formatada
 * @returns String com data formatada (ex: "24/01/2026")
 */
export function formatarData(data: Date | string): string {
  try {
    const date = typeof data === 'string' ? new Date(data) : data
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

/**
 * Formata uma data e hora em formato pt-BR
 * @param data - A data a ser formatada
 * @returns String com data e hora formatada (ex: "24/01/2026 14:30")
 */
export function formatarDataHora(data: Date | string): string {
  try {
    const date = typeof data === 'string' ? new Date(data) : data
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}
