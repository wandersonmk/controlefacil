import type { Ref } from 'vue'

export interface AdminCliente {
  id: string
  nome: string
  email: string
  whatsapp: string | null
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired'
  subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise'
  subscription_period: 'trial' | '1month' | '6months' | '12months'
  trial_ends_at: string | null
  subscription_renews_at: string | null
  ativo: boolean
  created_at: string
  total_tokens: number
  used_tokens: number
  available_tokens: number
  role?: 'user' | 'admin' | 'superAdmin'
}

export interface AdminStats {
  totalClientes: number
  clientesTrial: number
  clientesPro: number
  clientesBasic: number
  clientesEnterprise: number
  clientesVencidos: number
  clientesAtivos: number
  clientesEssaSemana: number
}

export const useAdminClientes = () => {
  const clientes = ref<AdminCliente[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Calcula estatísticas
  const stats = computed<AdminStats>(() => {
    const total = clientes.value.length
    const trial = clientes.value.filter(c => c.subscription_status === 'trial').length
    const pro = clientes.value.filter(c => c.subscription_plan === 'pro').length
    const basic = clientes.value.filter(c => c.subscription_plan === 'basic').length
    const enterprise = clientes.value.filter(c => c.subscription_plan === 'enterprise').length
    const ativos = clientes.value.filter(c => c.ativo).length
    
    // Considera vencido se status for expired ou se trial_ends_at passou
    const vencidos = clientes.value.filter(c => {
      if (c.subscription_status === 'expired') return true
      if (c.trial_ends_at) {
        return new Date(c.trial_ends_at) < new Date()
      }
      if (c.subscription_renews_at) {
        return new Date(c.subscription_renews_at) < new Date()
      }
      return false
    }).length

    // Clientes cadastrados nos últimos 7 dias
    const umaSemanaAtras = new Date()
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)
    const essaSemana = clientes.value.filter(c => {
      return new Date(c.created_at) >= umaSemanaAtras
    }).length

    return {
      totalClientes: total,
      clientesTrial: trial,
      clientesPro: pro,
      clientesBasic: basic,
      clientesEnterprise: enterprise,
      clientesVencidos: vencidos,
      clientesAtivos: ativos,
      clientesEssaSemana: essaSemana
    }
  })

  // Carrega clientes do banco de dados
  const loadClientes = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean, data?: AdminCliente[], error?: string }>('/api/admin/clientes')
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao carregar clientes')
      }

      clientes.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar clientes'
      console.error('Erro ao carregar clientes:', err)
    } finally {
      loading.value = false
    }
  }

  // Desativa cliente (zera dias/torna inativo)
  const desativarCliente = async (clienteId: string) => {
    try {
      const response = await $fetch<{ success: boolean, message?: string }>('/api/admin/desativar', {
        method: 'POST',
        body: { clienteId }
      })

      if (!response.success) {
        throw new Error('Erro ao desativar cliente')
      }

      // Atualiza localmente
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (cliente) {
        cliente.ativo = false
        cliente.subscription_status = 'canceled'
      }
    } catch (err: any) {
      console.error('Erro ao desativar cliente:', err)
      throw err
    }
  }

  // Reativa cliente
  const reativarCliente = async (clienteId: string) => {
    try {
      const response = await $fetch<{ success: boolean, message?: string }>('/api/admin/reativar', {
        method: 'POST',
        body: { clienteId }
      })

      if (!response.success) {
        throw new Error('Erro ao reativar cliente')
      }

      // Atualiza localmente - apenas muda ativo para true (mantém subscription_status original)
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (cliente) {
        cliente.ativo = true
        // NÃO altera subscription_status - mantém o estado original (trial, expired, etc.)
      }
    } catch (err: any) {
      console.error('Erro ao reativar cliente:', err)
      throw err
    }
  }

  // Renova assinatura do cliente
  const renovarAssinatura = async (
    clienteId: string,
    plan: 'free' | 'basic' | 'pro' | 'enterprise',
    period: 'trial' | '1month' | '6months' | '12months'
  ) => {
    try {
      const response = await $fetch<{ success: boolean, message?: string }>('/api/admin/renovar-assinatura', {
        method: 'POST',
        body: { clienteId, plan, period }
      })

      if (!response.success) {
        throw new Error('Erro ao renovar assinatura')
      }

      // Mapeamento de tokens por período
      const tokensByPeriod: Record<string, number> = {
        trial: 10000,
        '1month': 100000,
        '6months': 250000,
        '12months': 500000
      }

      // Calcula data de renovação para atualizar localmente usando dias fixos
      const now = new Date()
      let days = 30 // 1 mês por padrão
      
      if (period === 'trial') days = 7
      if (period === '1month') days = 30
      if (period === '6months') days = 180
      if (period === '12months') days = 365
      
      const renewDate = new Date(now)
      renewDate.setDate(renewDate.getDate() + days)

      // Atualiza localmente
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (cliente) {
        cliente.subscription_plan = plan
        cliente.subscription_period = period
        cliente.subscription_status = 'active'
        cliente.ativo = true
        
        // Soma os tokens do plano aos tokens existentes
        const tokensToAdd = tokensByPeriod[period] || 0
        cliente.total_tokens += tokensToAdd
        cliente.available_tokens = cliente.total_tokens - cliente.used_tokens
        
        if (period === 'trial') {
          cliente.trial_ends_at = renewDate.toISOString()
          cliente.subscription_renews_at = null
        } else {
          cliente.subscription_renews_at = renewDate.toISOString()
          cliente.trial_ends_at = null
        }
      }
    } catch (err: any) {
      console.error('Erro ao renovar assinatura:', err)
      throw err
    }
  }

  // Renova tokens do cliente
  const renovarTokens = async (clienteId: string, totalTokens: number) => {
    try {
      const response = await $fetch<{ success: boolean, message?: string }>('/api/admin/renovar-tokens', {
        method: 'POST',
        body: { clienteId, totalTokens }
      })

      if (!response.success) {
        throw new Error('Erro ao renovar tokens')
      }

      // Atualiza localmente - SOMA aos tokens existentes
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (cliente) {
        cliente.total_tokens += totalTokens  // SOMA em vez de substituir
        cliente.available_tokens = cliente.total_tokens - cliente.used_tokens  // Recalcula disponível
      }
    } catch (err: any) {
      console.error('Erro ao renovar tokens:', err)
      throw err
    }
  }

  // Remove tokens do cliente
  const removerTokens = async (clienteId: string, tokensToRemove: number) => {
    try {
      const response = await $fetch<{ 
        success: boolean, 
        message?: string,
        newTotalTokens?: number,
        availableTokens?: number 
      }>('/api/admin/remover-tokens', {
        method: 'POST',
        body: { clienteId, tokensToRemove }
      })

      if (!response.success) {
        throw new Error(response.message || 'Erro ao remover tokens')
      }

      // Atualiza localmente - SUBTRAI do total
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (cliente && response.newTotalTokens !== undefined && response.availableTokens !== undefined) {
        cliente.total_tokens = response.newTotalTokens
        cliente.available_tokens = response.availableTokens
      }
    } catch (err: any) {
      console.error('Erro ao remover tokens:', err)
      throw err
    }
  }

  // Exclui cliente permanentemente
  const excluirCliente = async (clienteId: string) => {
    try {
      const response = await $fetch<{ success: boolean, message?: string }>('/api/admin/excluir', {
        method: 'POST',
        body: { clienteId }
      })

      if (!response.success) {
        throw new Error('Erro ao excluir cliente')
      }

      // Remove da lista local
      const index = clientes.value.findIndex(c => c.id === clienteId)
      if (index !== -1) {
        clientes.value.splice(index, 1)
      }
    } catch (err: any) {
      console.error('Erro ao excluir cliente:', err)
      throw err
    }
  }

  // Edita dados do cliente
  const editarCliente = async (
    clienteId: string, 
    dados: { nome: string, email: string, whatsapp: string | null }
  ) => {
    try {
      const response = await $fetch<{ success: boolean, message?: string }>('/api/admin/editar', {
        method: 'POST',
        body: { 
          clienteId,
          nome: dados.nome,
          email: dados.email,
          whatsapp: dados.whatsapp
        }
      })

      if (!response.success) {
        throw new Error('Erro ao editar cliente')
      }

      // Atualiza localmente
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (cliente) {
        cliente.nome = dados.nome
        cliente.email = dados.email
        cliente.whatsapp = dados.whatsapp
      }
    } catch (err: any) {
      console.error('Erro ao editar cliente:', err)
      throw err
    }
  }

  // Verifica se assinatura está vencida
  const isVencido = (cliente: AdminCliente): boolean => {
    if (cliente.subscription_status === 'expired') return true
    
    // Se tem assinatura ativa, verifica subscription_renews_at
    if (cliente.subscription_status === 'active' && cliente.subscription_renews_at) {
      return new Date(cliente.subscription_renews_at) < new Date()
    }
    
    // Se está em trial, verifica trial_ends_at
    if (cliente.subscription_status === 'trial' && cliente.trial_ends_at) {
      return new Date(cliente.trial_ends_at) < new Date()
    }
    
    return false
  }

  // Calcula dias até o vencimento
  const diasParaVencimento = (cliente: AdminCliente): number => {
    let dataVencimento: string | null = null
    
    // Se tem assinatura ativa, usa subscription_renews_at
    if (cliente.subscription_status === 'active' && cliente.subscription_renews_at) {
      dataVencimento = cliente.subscription_renews_at
    }
    // Se está em trial ou não tem subscription_renews_at, usa trial_ends_at
    else if (cliente.trial_ends_at) {
      dataVencimento = cliente.trial_ends_at
    }
    
    if (!dataVencimento) return 0
    
    const hoje = new Date()
    const vencimento = new Date(dataVencimento)
    const diff = vencimento.getTime() - hoje.getTime()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    return dias
  }

  // Formata dias para vencimento com texto
  const formatDiasVencimento = (cliente: AdminCliente): string => {
    const dias = diasParaVencimento(cliente)
    
    if (dias < 0) return 'Faça renovação'
    if (dias === 0) return 'Vence hoje'
    if (dias === 1) return 'Vence amanhã'
    return `${dias} dias`
  }

  // Formata data
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Retorna cor do badge baseado no status
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      trial: 'bg-blue-500',
      active: 'bg-green-500',
      canceled: 'bg-gray-500',
      expired: 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  // Retorna label do plano
  const getPlanLabel = (plan: string): string => {
    const labels: Record<string, string> = {
      free: 'Gratuito',
      basic: 'Básico',
      pro: 'Pro',
      enterprise: 'Enterprise'
    }
    return labels[plan] || plan
  }

  return {
    clientes,
    stats,
    loading,
    error,
    loadClientes,
    desativarCliente,
    reativarCliente,
    renovarAssinatura,
    renovarTokens,
    removerTokens,
    excluirCliente,
    editarCliente,
    isVencido,
    diasParaVencimento,
    formatDiasVencimento,
    formatDate,
    getStatusColor,
    getPlanLabel
  }
}
