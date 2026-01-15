import type { PostgrestResponse } from '@supabase/supabase-js'

// Interface para tipagem da categoria
export interface Categoria {
  id: string
  empresa_id: string
  usuario_id: string
  nome: string
  tipo: string
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

// Interface para inserção/atualização de categoria
export interface CategoriaInput {
  nome: string
  tipo: string
  descricao?: string
}

export const useCategorias = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  // Estados reativos
  const categorias = ref<Categoria[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todas as categorias da empresa por tipo
  const fetchCategorias = async (tipo: string = 'fornecedor'): Promise<void> => {
    console.log('🔍 Iniciando busca de categorias tipo:', tipo)
    isLoading.value = true
    error.value = null
    try {
      const { data, error: categoriasError }: PostgrestResponse<Categoria> = await supabase
        .from('categorias')
        .select('*')
        .eq('tipo', tipo)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      console.log('📊 Resultado da busca:', { data, error: categoriasError })

      if (categoriasError) {
        console.error('❌ Erro ao buscar categorias:', categoriasError)
        error.value = `Erro ao carregar categorias: ${categoriasError.message}`
        return
      }

      console.log(`✅ ${data?.length || 0} categorias encontradas`)
      categorias.value = data || []
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar categorias:', err)
      error.value = 'Erro inesperado ao carregar categorias'
    } finally {
      isLoading.value = false
    }
  }

  // Adicionar nova categoria
  const addCategoria = async (categoriaData: CategoriaInput): Promise<Categoria | null> => {
    console.log('➕ Adicionando nova categoria:', categoriaData)
    isLoading.value = true
    error.value = null
    try {
      // Buscar empresa_id via função helper
      const { data: empresaData, error: empresaError } = await supabase
        .rpc('get_my_empresa_id')
      
      if (empresaError || !empresaData) {
        console.error('❌ Erro ao buscar empresa_id:', empresaError)
        error.value = 'Erro ao identificar empresa'
        return null
      }

      // Buscar user ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        error.value = 'Usuário não autenticado'
        return null
      }

      const { data, error: insertError } = await supabase
        .from('categorias')
        .insert([{
          ...categoriaData,
          empresa_id: empresaData,
          usuario_id: user.id
        }])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao adicionar categoria:', insertError)
        error.value = `Erro ao adicionar categoria: ${insertError.message}`
        return null
      }

      console.log('✅ Categoria adicionada com sucesso:', data)
      // Recarregar lista de categorias
      await fetchCategorias(categoriaData.tipo)
      return data
    } catch (err) {
      console.error('💥 Erro inesperado ao adicionar categoria:', err)
      error.value = 'Erro inesperado ao adicionar categoria'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Verificar se categoria já existe
  const categoriaExiste = async (nome: string, tipo: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', nome)
        .eq('tipo', tipo)
        .eq('ativo', true)
        .single()

      return !!data
    } catch {
      return false
    }
  }

  // Verificar se categoria está sendo usada
  const categoriaEmUso = async (nomeCategoria: string): Promise<{ emUso: boolean; count: number }> => {
    try {
      const { data, error: countError } = await supabase
        .from('fornecedores')
        .select('id', { count: 'exact', head: true })
        .eq('categoria', nomeCategoria)
        .eq('ativo', true)

      if (countError) {
        console.error('❌ Erro ao verificar uso da categoria:', countError)
        return { emUso: false, count: 0 }
      }

      const count = data || 0
      return { emUso: count > 0, count }
    } catch (err) {
      console.error('💥 Erro ao verificar uso da categoria:', err)
      return { emUso: false, count: 0 }
    }
  }

  // Deletar categoria (soft delete)
  const deleteCategoria = async (categoriaId: string, nomeCategoria: string): Promise<{ success: boolean; message?: string }> => {
    console.log('🗑️ Deletando categoria:', categoriaId, nomeCategoria)

    try {
      isLoading.value = true
      error.value = null

      // Verificar se está sendo usada
      const { emUso, count } = await categoriaEmUso(nomeCategoria)
      if (emUso) {
        const message = `Não é possível excluir esta categoria pois ${count} fornecedor${count > 1 ? 'es' : ''} está${count > 1 ? 'ão' : ''} usando ela.`
        error.value = message
        return { success: false, message }
      }

      const { error: deleteError } = await supabase
        .from('categorias')
        .update({ ativo: false })
        .eq('id', categoriaId)

      if (deleteError) {
        console.error('❌ Erro ao deletar categoria:', deleteError)
        error.value = `Erro ao deletar categoria: ${deleteError.message}`
        return { success: false, message: error.value }
      }

      console.log('✅ Categoria deletada com sucesso')
      
      // Recarregar lista de categorias
      const tipoCategoria = categorias.value.find(c => c.id === categoriaId)?.tipo || 'fornecedor'
      await fetchCategorias(tipoCategoria)
      
      return { success: true }
      
    } catch (err) {
      console.error('💥 Erro inesperado ao deletar categoria:', err)
      error.value = 'Erro inesperado ao deletar categoria'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Limpar erro
  const clearError = (): void => {
    error.value = null
  }

  // Retornar estados e funções reativas
  return {
    categorias,
    isLoading,
    error,
    fetchCategorias,
    addCategoria,
    categoriaExiste,
    categoriaEmUso,
    deleteCategoria,
    clearError
  }
}
