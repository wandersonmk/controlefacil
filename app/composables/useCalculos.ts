import { ref } from 'vue'
import { useSupabaseClient } from './useSupabaseClient'

export interface CalculoSalvo {
  id: string
  empresa_id?: string
  usuario_id?: string
  nome: string
  nome_produto: string
  custo_item_base: number
  quantidade_total: number
  quantidade_por_porcao: number
  unidade_medida_total: string
  unidade_medida_porcao: string
  custo_embalagem: number
  outros_custos_variaveis: number
  incluir_custos_fixos: boolean
  custo_aluguel: number
  custo_agua: number
  custo_energia: number
  custo_mao_de_obra: number
  outros_custos_fixos: number
  vendas_estimadas: number
  margem_lucro: number
  taxa_plataforma: number
  preco_venda_sugerido: number
  ingredientes: any[]
  created_at?: string
  updated_at?: string
}

export function useCalculos() {
  // SSR safety: só inicializa supabase no cliente
  const supabase = process.client ? useSupabaseClient() : null
  const { user } = useAuth()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar empresa_id do usuário
  async function getEmpresaId(): Promise<string | null> {
    if (!user.value || !supabase) return null
    
    const { data, error: err } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', user.value.id)
      .single()
    
    if (err) {
      console.error('Erro ao buscar empresa_id:', err)
      return null
    }
    
    return data?.empresa_id || null
  }

  // Listar todos os cálculos da empresa
  async function listarCalculos(): Promise<CalculoSalvo[]> {
    if (!user.value || !supabase) return []
    
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('calculos_salvos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (err) throw err
      
      return data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao listar cálculos:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Salvar novo cálculo
  async function salvarCalculo(calculo: Omit<CalculoSalvo, 'id' | 'created_at' | 'updated_at'>): Promise<CalculoSalvo | null> {
    if (!user.value || !supabase) {
      error.value = 'Usuário não autenticado'
      return null
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const empresaId = await getEmpresaId()
      if (!empresaId) {
        throw new Error('Empresa não encontrada')
      }
      
      const { data, error: err } = await supabase
        .from('calculos_salvos')
        .insert({
          ...calculo,
          empresa_id: empresaId,
          usuario_id: user.value.id
        })
        .select()
        .single()
      
      if (err) throw err
      
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao salvar cálculo:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Atualizar cálculo existente
  async function atualizarCalculo(id: string, calculo: Partial<CalculoSalvo>): Promise<boolean> {
    if (!user.value || !supabase) {
      error.value = 'Usuário não autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const { error: err } = await supabase
        .from('calculos_salvos')
        .update(calculo)
        .eq('id', id)
        .eq('usuario_id', user.value.id) // Garante que só atualiza próprio cálculo
      
      if (err) throw err
      
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao atualizar cálculo:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Deletar cálculo
  async function deletarCalculo(id: string): Promise<boolean> {
    if (!user.value || !supabase) {
      error.value = 'Usuário não autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const { error: err } = await supabase
        .from('calculos_salvos')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.value.id) // Garante que só deleta próprio cálculo
      
      if (err) throw err
      
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao deletar cálculo:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Buscar cálculo por ID
  async function buscarCalculo(id: string): Promise<CalculoSalvo | null> {
    if (!user.value || !supabase) return null
    
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('calculos_salvos')
        .select('*')
        .eq('id', id)
        .single()
      
      if (err) throw err
      
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao buscar cálculo:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    listarCalculos,
    salvarCalculo,
    atualizarCalculo,
    deletarCalculo,
    buscarCalculo
  }
}
