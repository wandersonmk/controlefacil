export const useEntradas = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  interface Entrada {
    id: string
    empresa_id: string
    usuario_id: string
    descricao: string
    valor: number
    data: string
    categoria: string
    forma_recebimento: string
    formaRecebimento?: string // Adicionar compatibilidade
    status: string
    observacoes?: string
    created_at: string
    updated_at: string
  }

  const entradas = ref<Entrada[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Mapear dados do banco para o formato esperado
  const mapearEntrada = (entradaDb: any) => ({
    ...entradaDb,
    formaRecebimento: entradaDb.forma_recebimento || entradaDb.formaRecebimento
  })

  // Buscar entradas da empresa
  const fetchEntradas = async () => {
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
        .from('entradas')
        .select('*')
        .eq('empresa_id', userData.empresa_id)
        .order('data', { ascending: false })

      if (fetchError) throw fetchError

      entradas.value = (data || []).map(mapearEntrada)
    } catch (err: any) {
      console.error('Erro ao buscar entradas:', err)
      error.value = err.message
      entradas.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Adicionar entrada
  const addEntrada = async (entradaData: Omit<Entrada, 'id' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>) => {
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
        .from('entradas')
        .insert([{
          ...entradaData,
          empresa_id: userData.empresa_id,
          usuario_id: currentUser.id
        }])
        .select()

      if (insertError) throw insertError
if (toast) toast.success('Entrada registrada com sucesso!')
      await fetchEntradas()
      
      return data
    } catch (err: any) {
      console.error('Erro ao adicionar entrada:', err)
      const toast = await useToastSafe()
      if (toast) console.error('Erro ao adicionar entrada:', err)
      toast.error('Erro ao registrar entrada')
      error.value = err.message
      throw err
    }
  }

  // Atualizar entrada
  const updateEntrada = async (id: string, entradaData: Partial<Omit<Entrada, 'id' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const toast = await useToastSafe()
      const { data, error: updateError } = await supabase
        .from('entradas')
        .update(entradaData)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (toast) toast.success('Entrada atualizada com sucesso!')
      await fetchEntradas()
      
      return data
    } catch (err: any) {
      console.error('Erro ao atualizar entrada:', err)
      const toast = await useToastSafe()
      if (toast) toast.error('Erro ao atualizar entrada')
      error.value = err.message
      throw err
    }
  }

  // Deletar entrada
  const deleteEntrada = async (id: string) => {
    try {
      const toast = await useToastSafe()
      const { error: deleteError } = await supabase
        .from('entradas')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      if (toast) toast.success('Entrada excluída com sucesso!')
      await fetchEntradas()
    } catch (err: any) {
      console.error('Erro ao deletar entrada:', err)
      const toast = await useToastSafe()
      if (toast) toast.error('Erro ao excluir entrada')
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

    return entradas.value
      .filter(e => new Date(e.data) >= dataInicio && e.status === 'Confirmada')
      .reduce((sum, e) => sum + Number(e.valor), 0)
  }

  return {
    entradas,
    isLoading,
    error,
    fetchEntradas,
    addEntrada,
    updateEntrada,
    deleteEntrada,
    calcularResumo
  }
}
