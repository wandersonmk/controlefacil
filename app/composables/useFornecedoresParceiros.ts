// Interface para tipagem do fornecedor parceiro
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

// Interface para inserção/atualização de fornecedor parceiro
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

export const useFornecedoresParceiros = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  // Estados reativos
  const fornecedoresParceiros = ref<FornecedorParceiro[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar fornecedores parceiros (para lojistas - API pública)
  const fetchFornecedoresParceiros = async (): Promise<void> => {
    console.log('🔍 Iniciando busca de fornecedores parceiros...')
    isLoading.value = true
    error.value = null
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        console.error('❌ Usuário não autenticado')
        error.value = 'Usuário não autenticado'
        return
      }

      console.log('📤 Fazendo request para API...')
      const response = await $fetch('/api/fornecedores-parceiros/listar', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      })

      console.log(`✅ ${response.fornecedores.length} fornecedores parceiros encontrados`)
      console.log('📦 Fornecedores:', response.fornecedores)
      fornecedoresParceiros.value = response.fornecedores
    } catch (err: any) {
      console.error('💥 Erro ao buscar fornecedores parceiros:', err)
      error.value = err.message || 'Erro ao carregar fornecedores parceiros'
    } finally {
      isLoading.value = false
    }
  }

  // Buscar fornecedores parceiros (para admin - API admin)
  const fetchFornecedoresParceirosAdmin = async (): Promise<void> => {
    console.log('🔍 [ADMIN] Iniciando busca de fornecedores parceiros...')
    isLoading.value = true
    error.value = null
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        error.value = 'Usuário não autenticado'
        return
      }

      const response = await $fetch('/api/admin/fornecedores-parceiros/listar', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      })

      console.log(`✅ [ADMIN] ${response.fornecedores.length} fornecedores parceiros encontrados`)
      fornecedoresParceiros.value = response.fornecedores
    } catch (err: any) {
      console.error('💥 [ADMIN] Erro ao buscar fornecedores parceiros:', err)
      error.value = err.message || 'Erro ao carregar fornecedores parceiros'
    } finally {
      isLoading.value = false
    }
  }

  // Adicionar fornecedor parceiro (admin apenas)
  const addFornecedorParceiro = async (fornecedorData: FornecedorParceiroInput): Promise<boolean> => {
    console.log('➕ [ADMIN] Adicionando fornecedor parceiro:', fornecedorData)
    isLoading.value = true
    error.value = null
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        error.value = 'Usuário não autenticado'
        return false
      }

      const response = await $fetch('/api/admin/fornecedores-parceiros/criar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        },
        body: fornecedorData
      })

      console.log('✅ [ADMIN] Fornecedor parceiro adicionado com sucesso')
      await fetchFornecedoresParceirosAdmin()
      return true
    } catch (err: any) {
      console.error('💥 [ADMIN] Erro ao adicionar fornecedor parceiro:', err)
      error.value = err.message || 'Erro ao adicionar fornecedor parceiro'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Atualizar fornecedor parceiro (admin apenas)
  const updateFornecedorParceiro = async (id: string, fornecedorData: Partial<FornecedorParceiroInput>): Promise<boolean> => {
    console.log('✏️ [ADMIN] Atualizando fornecedor parceiro:', id, fornecedorData)
    isLoading.value = true
    error.value = null
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        error.value = 'Usuário não autenticado'
        return false
      }

      const response = await $fetch('/api/admin/fornecedores-parceiros/editar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        },
        body: { id, ...fornecedorData }
      })

      console.log('✅ [ADMIN] Fornecedor parceiro atualizado com sucesso')
      await fetchFornecedoresParceirosAdmin()
      return true
    } catch (err: any) {
      console.error('💥 [ADMIN] Erro ao atualizar fornecedor parceiro:', err)
      error.value = err.message || 'Erro ao atualizar fornecedor parceiro'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Excluir fornecedor parceiro (admin apenas)
  const deleteFornecedorParceiro = async (id: string): Promise<boolean> => {
    console.log('🗑️ [ADMIN] Excluindo fornecedor parceiro:', id)
    isLoading.value = true
    error.value = null
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        error.value = 'Usuário não autenticado'
        return false
      }

      await $fetch('/api/admin/fornecedores-parceiros/excluir', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        },
        body: { id }
      })

      console.log('✅ [ADMIN] Fornecedor parceiro excluído com sucesso')
      await fetchFornecedoresParceirosAdmin()
      return true
    } catch (err: any) {
      console.error('💥 [ADMIN] Erro ao excluir fornecedor parceiro:', err)
      error.value = err.message || 'Erro ao excluir fornecedor parceiro'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Limpar erro
  const clearError = (): void => {
    error.value = null
  }

  // Estados únicos (cidades e estados)
  const estados = computed(() => {
    const estadosUnicos = new Set(fornecedoresParceiros.value.map(f => f.estado))
    return Array.from(estadosUnicos).sort()
  })

  const cidades = computed(() => {
    const cidadesUnicas = new Set(fornecedoresParceiros.value.map(f => f.cidade))
    return Array.from(cidadesUnicas).sort()
  })

  // Retornar estados e funções reativas
  return {
    fornecedoresParceiros,
    isLoading,
    error,
    estados,
    cidades,
    fetchFornecedoresParceiros,
    fetchFornecedoresParceirosAdmin,
    addFornecedorParceiro,
    updateFornecedorParceiro,
    deleteFornecedorParceiro,
    clearError
  }
}
