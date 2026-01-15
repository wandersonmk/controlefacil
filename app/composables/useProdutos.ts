export const useProdutos = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  // Interface para Produto
  interface Produto {
    id: string
    empresa_id: string
    usuario_id: string
    nome: string
    descricao: string | null
    categoria: string | null
    quantidade: number
    quantidade_minima: number
    preco_custo: number
    preco_venda: number
    unidade_medida: string
    codigo_barras: string | null
    localizacao: string | null
    ativo: boolean
    created_at: string
    updated_at: string
  }

  // Estados reativos
  const produtos = ref<Produto[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Função para buscar produtos da empresa do usuário
  const fetchProdutos = async () => {
    console.log('🔍 Iniciando busca de produtos...')
    isLoading.value = true
    error.value = null

    try {
      // Buscar empresa_id do usuário atual
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar empresa_id do usuário
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', currentUser.id)
        .single()

      if (userError) {
        console.error('❌ Erro ao buscar dados do usuário:', userError)
        throw userError
      }

      if (!userData?.empresa_id) {
        throw new Error('Usuário não vinculado a uma empresa')
      }

      // Buscar produtos da empresa
      const { data, error: fetchError } = await supabase
        .from('produtos')
        .select('*')
        .eq('empresa_id', userData.empresa_id)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (fetchError) {
        console.error('❌ Erro ao buscar produtos:', fetchError)
        throw fetchError
      }

      console.log('✅ Produtos encontrados:', data?.length || 0)
      produtos.value = data || []
    } catch (err: any) {
      console.error('❌ Erro na busca de produtos:', err)
      error.value = err.message || 'Erro ao carregar produtos'
      produtos.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Função para adicionar produto
  const addProduto = async (produtoData: Omit<Produto, 'id' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar empresa_id do usuário
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', currentUser.id)
        .single()

      if (userError || !userData?.empresa_id) {
        throw new Error('Usuário não vinculado a uma empresa')
      }

      const { data, error: insertError } = await supabase
        .from('produtos')
        .insert([
          {
            ...produtoData,
            empresa_id: userData.empresa_id,
            usuario_id: currentUser.id
          }
        ])
        .select()

      if (insertError) {
        console.error('❌ Erro ao adicionar produto:', insertError)
        throw insertError
      }

      console.log('✅ Produto adicionado:', data)
      
      // Recarregar a lista
      await fetchProdutos()
      
      return data
    } catch (err: any) {
      console.error('❌ Erro ao adicionar produto:', err)
      error.value = err.message || 'Erro ao adicionar produto'
      throw err
    }
  }

  // Função para atualizar produto
  const updateProduto = async (id: string, produtoData: Partial<Omit<Produto, 'id' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('produtos')
        .update(produtoData)
        .eq('id', id)
        .select()

      if (updateError) {
        console.error('❌ Erro ao atualizar produto:', updateError)
        throw updateError
      }

      console.log('✅ Produto atualizado:', data)
      
      // Recarregar a lista
      await fetchProdutos()
      
      return data
    } catch (err: any) {
      console.error('❌ Erro ao atualizar produto:', err)
      error.value = err.message || 'Erro ao atualizar produto'
      throw err
    }
  }

  // Função para deletar produto (soft delete)
  const deleteProduto = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id)

      if (deleteError) {
        console.error('❌ Erro ao deletar produto:', deleteError)
        throw deleteError
      }

      console.log('✅ Produto deletado com sucesso')
      
      // Recarregar a lista
      await fetchProdutos()
    } catch (err: any) {
      console.error('❌ Erro ao deletar produto:', err)
      error.value = err.message || 'Erro ao deletar produto'
      throw err
    }
  }

  // Função para ajustar quantidade do produto
  const ajustarQuantidade = async (id: string, novaQuantidade: number) => {
    try {
      const { data, error: updateError } = await supabase
        .from('produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', id)
        .select()

      if (updateError) {
        console.error('❌ Erro ao ajustar quantidade:', updateError)
        throw updateError
      }

      console.log('✅ Quantidade ajustada:', data)
      
      // Recarregar a lista
      await fetchProdutos()
      
      return data
    } catch (err: any) {
      console.error('❌ Erro ao ajustar quantidade:', err)
      error.value = err.message || 'Erro ao ajustar quantidade'
      throw err
    }
  }

  // Função para limpar erros
  const clearError = () => {
    error.value = null
  }

  return {
    produtos,
    isLoading,
    error,
    fetchProdutos,
    addProduto,
    updateProduto,
    deleteProduto,
    ajustarQuantidade,
    clearError
  }
}
