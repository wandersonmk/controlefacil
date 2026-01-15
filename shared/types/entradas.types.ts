// Tipos para o módulo de Entradas Financeiras

export interface Entrada {
  id: string
  descricao: string
  valor: number
  data: string // ISO string
  categoria: string
  formaRecebimento: 'Pix' | 'Cartão' | 'Dinheiro' | 'Transferência' | 'Outro'
  status: 'Confirmada' | 'Pendente'
  centroCusto?: string
  tags?: string[]
  recorrente?: boolean
  frequenciaRecorrencia?: 'Semanal' | 'Mensal' | 'Anual'
  dataFinalRecorrencia?: string
  anexo?: string
  observacoes?: string
  createdAt: string
}

export interface EntradaInput {
  descricao: string
  valor: number
  data: string
  categoria: string
  formaRecebimento: 'Pix' | 'Cartão' | 'Dinheiro' | 'Transferência' | 'Outro'
  status?: 'Confirmada' | 'Pendente'
  centroCusto?: string
  tags?: string[]
  recorrente?: boolean
  frequenciaRecorrencia?: 'Semanal' | 'Mensal' | 'Anual'
  dataFinalRecorrencia?: string
  observacoes?: string
}

export interface FiltrosEntradas {
  dataInicial?: string
  dataFinal?: string
  categoria?: string
  formaRecebimento?: string
  valorMin?: number
  valorMax?: number
  status?: string
}

export interface ResumoEntradas {
  diario: number
  semanal: number
  mensal: number
  anual: number
  variacaoDiaria: number
  variacaoSemanal: number
  variacaoMensal: number
  variacaoAnual: number
}
