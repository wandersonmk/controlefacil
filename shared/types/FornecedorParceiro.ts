// Fornecedor Parceiro
export interface FornecedorParceiro {
  id: string
  nome: string
  empresa: string
  cnpj?: string
  categoria: string
  email?: string
  telefone: string
  whatsapp?: string
  endereco?: string
  cidade: string
  estado: string
  descricao?: string
  site?: string
  logo_url?: string
  ativo: boolean
  destaque: boolean
  created_at: string
  updated_at: string
}

export interface FornecedorParceiroInput {
  nome: string
  empresa: string
  cnpj?: string
  categoria: string
  email?: string
  telefone: string
  whatsapp?: string
  endereco?: string
  cidade: string
  estado: string
  descricao?: string
  site?: string
  logo_url?: string
  destaque?: boolean
}
