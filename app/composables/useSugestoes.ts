import { ref, computed } from 'vue'
import { useSupabaseClient } from './useSupabaseClient'
import { useAuth } from './useAuth'

interface Sugestao {
  id: string
  titulo: string
  descricao: string
  categoria: string
  status: string
  observacoes_admin?: string
  empresa_id: string
  usuario_id: string
  empresa_nome: string
  curtidas: number
  comentarios: number
  criado_em: string
  ja_curtiu?: boolean
}

export const useSugestoes = () => {
  // Usar supabase do cliente
  let supabaseClient: any = null
  try {
    supabaseClient = useSupabaseClient()
  } catch (err) {
    console.error('Erro ao inicializar Supabase:', err)
  }

  // Usar auth para pegar user
  const { user } = useAuth()
  
  const sugestoes = ref<Sugestao[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todas as sugestões com dados da empresa
  const fetchSugestoes = async (isSuperAdmin: boolean = false) => {
    if (!supabaseClient) {
      error.value = 'Supabase não está inicializado'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('[useSugestoes] Carregando sugestões... isSuperAdmin:', isSuperAdmin)
      
      const { data, error: err } = await supabaseClient
        .from('sugestoes')
        .select(`
          id,
          titulo,
          descricao,
          categoria,
          status,
          observacoes_admin,
          empresa_id,
          usuario_id,
          empresa_nome,
          curtidas,
          comentarios,
          criado_em
        `)
        .order('criado_em', { ascending: false })

      if (err) throw err

      console.log('[useSugestoes] Sugestões carregadas:', data?.length)

      // Para super admin, não precisa verificar curtidas
      if (isSuperAdmin) {
        sugestoes.value = (data as any[]).map((s: any) => ({
          ...s,
          empresa_nome: s.empresa_nome || 'Empresa',
          ja_curtiu: false
        }))
        console.log('[useSugestoes] Admin view - sem verificação de curtidas')
        return
      }

      // Para usuários normais, verifica curtidas
      if (data && user.value?.id) {
        const ids = (data as any[]).map((s: any) => s.id)
        const { data: curtidas_usuario } = await supabaseClient
          .from('sugestoes_curtidas')
          .select('sugestao_id')
          .in('sugestao_id', ids)
          .eq('usuario_id', user.value.id)

        const curtidas_set = new Set(curtidas_usuario?.map((c: any) => c.sugestao_id) || [])

        sugestoes.value = (data as any[]).map((s: any) => ({
          ...s,
          empresa_nome: s.empresa_nome || 'Empresa',
          ja_curtiu: curtidas_set.has(s.id)
        }))
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar sugestões'
      console.error('Erro ao buscar sugestões:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Criar nova sugestão
  const criarSugestao = async (titulo: string, descricao: string, categoria: string) => {
    if (!supabaseClient) {
      error.value = 'Supabase não está inicializado'
      console.error('[useSugestoes] Supabase não inicializado')
      return
    }

    if (!user.value?.id) {
      error.value = 'Usuário não identificado'
      console.error('[useSugestoes] Usuário não identificado:', user.value)
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Buscar a empresa do usuário através da tabela usuarios
      console.log('[useSugestoes] Buscando empresa para usuário:', user.value.id)
      const { data: usuarioData, error: usuarioErr } = await supabaseClient
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.value.id)
        .single()

      if (usuarioErr) {
        console.error('[useSugestoes] Erro ao buscar usuário:', usuarioErr)
        error.value = 'Erro ao buscar dados do usuário'
        return
      }

      if (!usuarioData?.empresa_id) {
        console.error('[useSugestoes] Usuário sem empresa associada')
        error.value = 'Usuário não está associado a uma empresa'
        return
      }

      // Buscar nome da empresa
      const { data: empresaData } = await supabaseClient
        .from('empresas')
        .select('nome')
        .eq('id', usuarioData.empresa_id)
        .single()

      const empresaNome = empresaData?.nome || 'Empresa'

      console.log('[useSugestoes] Criando sugestão com:', { 
        titulo, 
        descricao, 
        categoria, 
        usuario_id: user.value.id, 
        empresa_id: usuarioData.empresa_id,
        empresa_nome: empresaNome
      })
      
      const { data, error: err } = await supabaseClient
        .from('sugestoes')
        .insert({
          titulo,
          descricao,
          categoria,
          usuario_id: user.value.id,
          empresa_id: usuarioData.empresa_id,
          empresa_nome: empresaNome,
          status: 'analise'
        })
        .select()

      if (err) {
        console.error('[useSugestoes] Erro do Supabase:', err)
        error.value = err.message || 'Erro ao criar sugestão'
        throw err
      }

      console.log('[useSugestoes] Sugestão criada com sucesso:', data)
      
      // Recarregar sugestões
      await fetchSugestoes()
      return data?.[0]
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar sugestão'
      error.value = errorMsg
      console.error('[useSugestoes] Erro ao criar sugestão:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Curtir sugestão
  const curtirSugestao = async (sugestaoId: string) => {
    if (!supabaseClient || !user.value?.id) return

    try {
      // Verificar se já curtiu
      const { data: jaExiste } = await supabaseClient
        .from('sugestoes_curtidas')
        .select('id')
        .eq('sugestao_id', sugestaoId)
        .eq('usuario_id', user.value.id)
        .single()

      if (jaExiste) {
        console.log('Já curtiu essa sugestão')
        return
      }

      const { error: err } = await supabaseClient
        .from('sugestoes_curtidas')
        .insert({
          sugestao_id: sugestaoId,
          usuario_id: user.value.id
        })

      if (err) throw err

      // Contar curtidas reais do banco
      const { count: totalCurtidas } = await supabaseClient
        .from('sugestoes_curtidas')
        .select('id', { count: 'exact' })
        .eq('sugestao_id', sugestaoId)

      // Atualizar contador de curtidas
      const sugestao = sugestoes.value.find((s: any) => s.id === sugestaoId)
      if (sugestao && totalCurtidas !== null) {
        sugestao.curtidas = totalCurtidas
        sugestao.ja_curtiu = true
      }
    } catch (err) {
      console.error('Erro ao curtir sugestão:', err)
    }
  }

  // Descurtir sugestão
  const descurtirSugestao = async (sugestaoId: string) => {
    if (!supabaseClient || !user.value?.id) return

    try {
      const { error: err } = await supabaseClient
        .from('sugestoes_curtidas')
        .delete()
        .eq('sugestao_id', sugestaoId)
        .eq('usuario_id', user.value.id)

      if (err) throw err

      // Contar curtidas reais do banco
      const { count: totalCurtidas } = await supabaseClient
        .from('sugestoes_curtidas')
        .select('id', { count: 'exact' })
        .eq('sugestao_id', sugestaoId)

      // Atualizar contador de curtidas
      const sugestao = sugestoes.value.find((s: any) => s.id === sugestaoId)
      if (sugestao && totalCurtidas !== null) {
        sugestao.curtidas = Math.max(0, totalCurtidas)
        sugestao.ja_curtiu = false
      }
    } catch (err) {
      console.error('Erro ao descurtir sugestão:', err)
    }
  }

  // Atualizar status de sugestão (apenas para super admin)
  const atualizarStatusSugestao = async (
    sugestaoId: string,
    novoStatus: string,
    observacao?: string
  ) => {
    if (!supabaseClient || !user.value?.id) return

    try {
      // Buscar status atual
      const sugestao = sugestoes.value.find((s: any) => s.id === sugestaoId)
      const statusAnterior = sugestao?.status

      // Atualizar sugestão
      const { error: err1 } = await supabaseClient
        .from('sugestoes')
        .update({
          status: novoStatus,
          observacoes_admin: observacao,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', sugestaoId)

      if (err1) throw err1

      // Registrar no histórico
      const { error: err2 } = await supabaseClient
        .from('sugestoes_historico_status')
        .insert({
          sugestao_id: sugestaoId,
          admin_id: user.value.id,
          status_anterior: statusAnterior,
          status_novo: novoStatus,
          observacao
        })

      if (err2) throw err2

      // Atualizar localmente
      if (sugestao) {
        sugestao.status = novoStatus
        sugestao.observacoes_admin = observacao
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar status'
      console.error('Erro ao atualizar status da sugestão:', err)
      return false
    }
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      analise: '🔍 Em Análise',
      aceita: '✅ Aceita',
      proxima: '⏭️ Próxima',
      em_desenvolvimento: '⚙️ Em Desenvolvimento',
      concluida: '🎉 Concluída',
      recusada: '❌ Recusada'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      analise: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      aceita: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      proxima: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      em_desenvolvimento: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      concluida: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
      recusada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    }
    return colors[status] || ''
  }

  return {
    sugestoes,
    isLoading,
    error,
    fetchSugestoes,
    criarSugestao,
    curtirSugestao,
    descurtirSugestao,
    atualizarStatusSugestao,
    getStatusLabel,
    getStatusColor
  }
}
