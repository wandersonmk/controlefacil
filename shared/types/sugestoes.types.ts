/**
 * Tipos para o módulo de Sugestões
 */

export interface Sugestao {
  id: string
  titulo: string
  descricao: string
  categoria: string
  status: 'analise' | 'aceita' | 'proxima' | 'em_desenvolvimento' | 'concluida' | 'recusada'
  observacoes_admin?: string
  empresa_id: string
  usuario_id: string
  empresa_nome: string
  curtidas: number
  comentarios: number
  criado_em: string
  atualizado_em?: string
  ja_curtiu?: boolean
}

export interface SugestaoComEmpresa extends Sugestao {
  empresa_nome: string
}

export interface SugestaoForm {
  titulo: string
  descricao: string
  categoria: string
}

export interface StatusSugestao {
  value: 'analise' | 'aceita' | 'proxima' | 'em_desenvolvimento' | 'concluida' | 'recusada'
  label: string
  icon?: string
}

export interface Comentario {
  id: string
  sugestao_id: string
  usuario_id: string
  empresa_id: string
  texto: string
  criado_em: string
  atualizado_em: string
  usuario_nome?: string
  usuario_avatar?: string
  empresa_nome?: string
}

export interface Curtida {
  id: string
  sugestao_id: string
  usuario_id: string
  criado_em: string
}

export interface HistoricoStatus {
  id: string
  sugestao_id: string
  admin_id: string
  status_anterior?: string
  status_novo: string
  observacao?: string
  criado_em: string
}
