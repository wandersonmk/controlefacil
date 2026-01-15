import type { PostgrestResponse } from '@supabase/supabase-js'

// Interface para tipagem do fornecedor
export interface Fornecedor {
  id: string
  empresa_id: string
  usuario_id: string
  nome: string
  empresa: string
  cnpj: string
  categoria: string
  email?: string
  telefone: string
  whatsapp?: string
  endereco?: string
  cidade?: string
  estado?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

// Interface para inserção/atualização de fornecedor
export interface FornecedorInput {
  nome: string
  empresa: string
  cnpj: string
  categoria: string
  email?: string
  telefone: string
  whatsapp?: string
  endereco?: string
  cidade?: string
  estado?: string
  observacoes?: string
}

export const useFornecedores = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  // Estados reativos
  const fornecedores = ref<Fornecedor[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todos os fornecedores da empresa
  const fetchFornecedores = async (): Promise<void> => {
    console.log('🔍 Iniciando busca de fornecedores...')
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fornecedoresError }: PostgrestResponse<Fornecedor> = await supabase
        .from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      console.log('📊 Resultado da busca:', { data, error: fornecedoresError })

      if (fornecedoresError) {
        console.error('❌ Erro ao buscar fornecedores:', fornecedoresError)
        error.value = `Erro ao carregar fornecedores: ${fornecedoresError.message}`
        return
      }

      console.log(`✅ ${data?.length || 0} fornecedores encontrados`)
      fornecedores.value = data || []
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar fornecedores:', err)
      error.value = 'Erro inesperado ao carregar fornecedores'
    } finally {
      isLoading.value = false
    }
  }

  // Adicionar novo fornecedor (com empresa_id e usuario_id)
  const addFornecedor = async (fornecedorData: FornecedorInput): Promise<boolean> => {
    console.log('➕ Adicionando novo fornecedor:', fornecedorData)
    isLoading.value = true
    error.value = null
    try {
      // Buscar empresa_id via função helper
      const { data: empresaData, error: empresaError } = await supabase
        .rpc('get_my_empresa_id')
      
      if (empresaError || !empresaData) {
        console.error('❌ Erro ao buscar empresa_id:', empresaError)
        error.value = 'Erro ao identificar empresa'
        return false
      }

      // Buscar user ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        error.value = 'Usuário não autenticado'
        return false
      }

      const { data, error: insertError } = await supabase
        .from('fornecedores')
        .insert([{
          ...fornecedorData,
          empresa_id: empresaData,
          usuario_id: user.id
        }])
        .select()

      if (insertError) {
        console.error('❌ Erro ao adicionar fornecedor:', insertError)
        error.value = `Erro ao adicionar fornecedor: ${insertError.message}`
        return false
      }

      console.log('✅ Fornecedor adicionado com sucesso:', data)
      // Recarregar lista de fornecedores
      await fetchFornecedores()
      return true
    } catch (err) {
      console.error('💥 Erro inesperado ao adicionar fornecedor:', err)
      error.value = 'Erro inesperado ao adicionar fornecedor'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Atualizar fornecedor
  const updateFornecedor = async (fornecedorId: string, fornecedorData: Partial<FornecedorInput>): Promise<boolean> => {
    console.log('✏️ Atualizando fornecedor:', fornecedorId, fornecedorData)

    try {
      isLoading.value = true
      error.value = null

      const { error: updateError } = await supabase
        .from('fornecedores')
        .update(fornecedorData)
        .eq('id', fornecedorId)

      if (updateError) {
        console.error('❌ Erro ao atualizar fornecedor:', updateError)
        error.value = `Erro ao atualizar fornecedor: ${updateError.message}`
        return false
      }

      console.log('✅ Fornecedor atualizado com sucesso')
      
      // Recarregar lista de fornecedores
      await fetchFornecedores()
      return true
      
    } catch (err) {
      console.error('💥 Erro inesperado ao atualizar fornecedor:', err)
      error.value = 'Erro inesperado ao atualizar fornecedor'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Deletar fornecedor (soft delete)
  const deleteFornecedor = async (fornecedorId: string): Promise<boolean> => {
    console.log('🗑️ Deletando fornecedor:', fornecedorId)

    try {
      isLoading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('fornecedores')
        .update({ ativo: false })
        .eq('id', fornecedorId)

      if (deleteError) {
        console.error('❌ Erro ao deletar fornecedor:', deleteError)
        error.value = `Erro ao deletar fornecedor: ${deleteError.message}`
        return false
      }

      console.log('✅ Fornecedor deletado com sucesso')
      
      // Recarregar lista de fornecedores
      await fetchFornecedores()
      return true
      
    } catch (err) {
      console.error('💥 Erro inesperado ao deletar fornecedor:', err)
      error.value = 'Erro inesperado ao deletar fornecedor'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Limpar erro
  const clearError = (): void => {
    error.value = null
  }

  // Retornar estados e funções reativas (readonly)
  return {
    fornecedores,
    isLoading,
    error,
    fetchFornecedores,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    clearError
  }
}
