export const useSaidas = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  interface Saida {
    id: string
    empresa_id: string
    usuario_id: string
    descricao: string
    valor: number
    data: string
    categoria: string
    forma_pagamento: string
    status: string
    funcionario?: string
    observacoes?: string
    created_at: string
    updated_at: string
  }

  const saidas = ref<Saida[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar saídas da empresa
  const fetchSaidas = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', currentUser.id)
        .single()

      if (userError || !userData?.empresa_id) {
        throw new Error('Usuário não vinculado a uma empresa')
      }

      const { data, error: fetchError } = await supabase
        .from('saidas')
        .select('*')
        .eq('empresa_id', userData.empresa_id)
        .order('data', { ascending: false })

      if (fetchError) throw fetchError

      saidas.value = data || []
    } catch (err: any) {
      console.error('Erro ao buscar saídas:', err)
      error.value = err.message
      saidas.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Adicionar saída
  const addSaida = async (saidaData: Omit<Saida, 'id' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>) => {
    try {
      const toast = await useToastSafe()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) throw new Error('Usuário não autenticado')

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', currentUser.id)
        .single()

      if (userError || !userData?.empresa_id) {
        throw new Error('Usuário não vinculado a uma empresa')
      }

      const { data, error: insertError } = await supabase
        .from('saidas')
        .insert([{
          ...saidaData,
          empresa_id: userData.empresa_id,
          usuario_id: currentUser.id
        }])
        .select()

      if (insertError) throw insertError

      if (toast) toast.success('Saída registrada com sucesso!')
      await fetchSaidas()
      
      return data
    } catch (err: any) {
      console.error('Erro ao adicionar saída:', err)
      const toast = await useToastSafe()
      if (toast) toast.error('Erro ao registrar saída')
      error.value = err.message
      throw err
    }
  }

  // Atualizar saída
  const updateSaida = async (id: string, saidaData: Partial<Omit<Saida, 'id' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const toast = await useToastSafe()
      const { data, error: updateError } = await supabase
        .from('saidas')
        .update(saidaData)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (toast) toast.success('Saída atualizada com sucesso!')
      await fetchSaidas()
      
      return data
    } catch (err: any) {
      console.error('Erro ao atualizar saída:', err)
      const toast = await useToastSafe()
      if (toast) toast.error('Erro ao atualizar saída')
      error.value = err.message
      throw err
    }
  }

  // Deletar saída
  const deleteSaida = async (id: string) => {
    try {
      const toast = await useToastSafe()
      const { error: deleteError } = await supabase
        .from('saidas')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      if (toast) toast.success('Saída excluída com sucesso!')
      await fetchSaidas()
    } catch (err: any) {
      console.error('Erro ao deletar saída:', err)
      const toast = await useToastSafe()
      if (toast) toast.error('Erro ao excluir saída')
      error.value = err.message
      throw err
    }
  }

  // Calcular totais
  const calcularResumo = (periodo: 'dia' | 'semana' | 'mes' | 'ano' = 'mes') => {
    const now = new Date()
    let dataInicio: Date

    switch (periodo) {
      case 'dia':
        dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'semana':
        dataInicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'mes':
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'ano':
        dataInicio = new Date(now.getFullYear(), 0, 1)
        break
    }

    return saidas.value
      .filter(s => new Date(s.data) >= dataInicio && s.status === 'Paga')
      .reduce((sum, s) => sum + Number(s.valor), 0)
  }

  return {
    saidas,
    isLoading,
    error,
    fetchSaidas,
    addSaida,
    updateSaida,
    deleteSaida,
    calcularResumo
  }
}
