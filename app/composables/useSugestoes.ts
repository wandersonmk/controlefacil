import { ref, computed } from 'vue'
import { useSupabaseClient } from './useSupabaseClient'
import { useAuth } from './useAuth'
import type { Sugestao } from '~/shared/types/sugestoes.types'

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

  const carregarTotalCurtidas = async (sugestoesIds: string[]) => {
    const mapa = new Map<string, number>()

    if (!supabaseClient || sugestoesIds.length === 0) {
      return mapa
    }

    try {
      const { data: curtidasData, error: curtidasErr } = await supabaseClient
        .from('sugestoes_curtidas')
        .select('sugestao_id')
        .in('sugestao_id', sugestoesIds)

      if (curtidasErr) {
        console.error('[useSugestoes] Erro ao buscar total de curtidas:', curtidasErr)
        return mapa
      }

      curtidasData?.forEach((c: any) => {
        const atual = mapa.get(c.sugestao_id) || 0
        mapa.set(c.sugestao_id, atual + 1)
      })
    } catch (err) {
      console.error('[useSugestoes] Erro inesperado ao contar curtidas:', err)
    }

    return mapa
  }

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

      const ids = (data as any[] | null)?.map((s: any) => s.id) || []
      const curtidasMap = await carregarTotalCurtidas(ids)

      // Para super admin, não precisa verificar se curtiu
      if (isSuperAdmin) {
        sugestoes.value = (data as any[]).map((s: any) => ({
          ...s,
          empresa_nome: s.empresa_nome || 'Empresa',
          curtidas: curtidasMap.get(s.id) ?? s.curtidas ?? 0,
          ja_curtiu: false
        }))
        console.log('[useSugestoes] Admin view - sem verificação de curtidas')
        return
      }

      // Para usuários normais, verifica curtidas
      if (data && user.value?.id) {
        console.log('[useSugestoes] Buscando dados do usuário, auth_user_id:', user.value.id)
        
        // Busca o ID do usuário na tabela usuarios (não é o auth.uid())
        const { data: usuarioData, error: usuarioErr } = await supabaseClient
          .from('usuarios')
          .select('id')
          .eq('auth_user_id', user.value.id)
          .single()

        console.log('[useSugestoes] Usuario encontrado:', usuarioData, 'Erro:', usuarioErr)

        if (usuarioData) {
          console.log('[useSugestoes] Buscando curtidas do usuário:', usuarioData.id)
          const { data: curtidas_usuario, error: curtidaErr } = await supabaseClient
            .from('sugestoes_curtidas')
            .select('sugestao_id')
            .in('sugestao_id', ids)
            .eq('usuario_id', usuarioData.id)

          console.log('[useSugestoes] Curtidas encontradas:', curtidas_usuario?.length || 0, 'Erro:', curtidaErr)

          if (!curtidaErr) {
            const curtidas_set = new Set(curtidas_usuario?.map((c: any) => c.sugestao_id) || [])

            sugestoes.value = (data as any[]).map((s: any) => ({
              ...s,
              empresa_nome: s.empresa_nome || 'Empresa',
              curtidas: curtidasMap.get(s.id) ?? s.curtidas ?? 0,
              ja_curtiu: curtidas_set.has(s.id)
            }))
            console.log('[useSugestoes] Sugestões mapeadas com curtidas do usuário')
          } else {
            console.error('[useSugestoes] Erro ao buscar curtidas, usando fallback')
            sugestoes.value = (data as any[]).map((s: any) => ({
              ...s,
              empresa_nome: s.empresa_nome || 'Empresa',
              curtidas: curtidasMap.get(s.id) ?? s.curtidas ?? 0,
              ja_curtiu: false
            }))
          }
        } else {
          console.log('[useSugestoes] Usuario não encontrado ou erro ao buscar, usando fallback')
          sugestoes.value = (data as any[]).map((s: any) => ({
            ...s,
            empresa_nome: s.empresa_nome || 'Empresa',
            curtidas: curtidasMap.get(s.id) ?? s.curtidas ?? 0,
            ja_curtiu: false
          }))
        }
      } else {
        console.log('[useSugestoes] Usuário não autenticado, marcando ja_curtiu = false')
        sugestoes.value = (data as any[]).map((s: any) => ({
          ...s,
          empresa_nome: s.empresa_nome || 'Empresa',
          curtidas: curtidasMap.get(s.id) ?? s.curtidas ?? 0,
          ja_curtiu: false
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
      console.log('[useSugestoes] Curtindo sugestão:', sugestaoId)
      
      // Buscar ID do usuário na tabela usuarios
      const { data: usuarioData } = await supabaseClient
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.value.id)
        .single()

      if (!usuarioData) {
        console.error('[useSugestoes] Usuário não encontrado')
        return
      }

      // Verificar se já curtiu
      const { data: jaExiste } = await supabaseClient
        .from('sugestoes_curtidas')
        .select('id')
        .eq('sugestao_id', sugestaoId)
        .eq('usuario_id', usuarioData.id)
        .maybeSingle()

      if (jaExiste) {
        console.log('[useSugestoes] Usuário já curtiu essa sugestão')
        return
      }

      const { error: err } = await supabaseClient
        .from('sugestoes_curtidas')
        .insert({
          sugestao_id: sugestaoId,
          usuario_id: usuarioData.id
        })

      if (err) throw err
      
      console.log('[useSugestoes] Curtida inserida com sucesso')

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
        console.log('[useSugestoes] Sugestão atualizada: curtidas =', totalCurtidas, 'ja_curtiu = true')
      }
    } catch (err) {
      console.error('[useSugestoes] Erro ao curtir sugestão:', err)
    }
  }

  // Descurtir sugestão
  const descurtirSugestao = async (sugestaoId: string) => {
    if (!supabaseClient || !user.value?.id) return

    try {
      console.log('[useSugestoes] Descurtindo sugestão:', sugestaoId)
      
      // Buscar ID do usuário na tabela usuarios
      const { data: usuarioData } = await supabaseClient
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.value.id)
        .single()

      if (!usuarioData) {
        console.error('[useSugestoes] Usuário não encontrado')
        return
      }

      const { error: err } = await supabaseClient
        .from('sugestoes_curtidas')
        .delete()
        .eq('sugestao_id', sugestaoId)
        .eq('usuario_id', usuarioData.id)

      if (err) throw err
      
      console.log('[useSugestoes] Curtida removida com sucesso')

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
        console.log('[useSugestoes] Sugestão atualizada: curtidas =', totalCurtidas, 'ja_curtiu = false')
      }
    } catch (err) {
      console.error('[useSugestoes] Erro ao descurtir sugestão:', err)
    }
  }

  // Carregar quais sugestões o usuário já curtiu
  const carregarCurtidasDoUsuario = async () => {
    if (!supabaseClient || !user.value?.id || sugestoes.value.length === 0) {
      console.log('[useSugestoes] Pulando carregarCurtidasDoUsuario - condições não atendidas')
      return
    }

    try {
      console.log('[useSugestoes] Carregando curtidas do usuário', user.value.id)

      // Buscar ID do usuário na tabela usuarios
      const { data: usuarioData, error: usuarioErr } = await supabaseClient
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.value.id)
        .single()

      if (usuarioErr) {
        console.error('[useSugestoes] Erro ao buscar usuário:', usuarioErr)
        return
      }

      if (!usuarioData) {
        console.log('[useSugestoes] Usuário não encontrado')
        return
      }

      // Buscar IDs de sugestões que o usuário curtiu
      const { data: curtidas, error: curtidasErr } = await supabaseClient
        .from('sugestoes_curtidas')
        .select('sugestao_id')
        .eq('usuario_id', usuarioData.id)

      if (curtidasErr) {
        console.error('[useSugestoes] Erro ao buscar curtidas:', curtidasErr)
        return
      }

      // Criar set de IDs para busca rápida
      const curtidasDoUsuario = new Set(curtidas?.map((c: any) => c.sugestao_id) || [])

      // Atualizar ja_curtiu para cada sugestão
      sugestoes.value.forEach((sugestao: any) => {
        sugestao.ja_curtiu = curtidasDoUsuario.has(sugestao.id)
      })

      console.log('[useSugestoes] Curtidas carregadas - total de curtidas do usuário:', curtidasDoUsuario.size)
    } catch (err) {
      console.error('[useSugestoes] Erro ao carregar curtidas:', err)
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
    getStatusColor,
    carregarCurtidasDoUsuario
  }
}
