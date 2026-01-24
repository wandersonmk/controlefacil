import { ref, computed } from 'vue'
import { useSupabaseClient } from './useSupabaseClient'
import { useAuth } from './useAuth'

export interface Comentario {
  id: string
  sugestao_id: string
  usuario_id: string
  empresa_id: string
  texto: string
  criado_em: string
  atualizado_em: string
  usuario_nome?: string
  usuario_avatar?: string
  empresa_nome?: string
}

export const useComentarios = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  
  const comentarios = ref<Comentario[]>([])
  const carregando = ref(false)
  const erro = ref<string | null>(null)

  const fetchComentarios = async (sugestaoId: string) => {
    try {
      carregando.value = true
      erro.value = null
      
      console.log('[useComentarios] Buscando comentários para sugestão:', sugestaoId)
      
      const { data, error } = await supabase
        .from('sugestoes_comentarios')
        .select(`
          id,
          sugestao_id,
          usuario_id,
          empresa_id,
          texto,
          usuario_nome,
          empresa_nome,
          criado_em,
          atualizado_em,
          usuarios:usuario_id (
            avatar_url
          )
        `)
        .eq('sugestao_id', sugestaoId)
        .order('criado_em', { ascending: false })

      if (error) {
        console.error('[useComentarios] Erro ao buscar:', error)
        throw error
      }

      comentarios.value = data?.map((c: any) => ({
        id: c.id,
        sugestao_id: c.sugestao_id,
        usuario_id: c.usuario_id,
        empresa_id: c.empresa_id,
        texto: c.texto,
        criado_em: c.criado_em,
        atualizado_em: c.atualizado_em,
        usuario_nome: c.usuario_nome || 'Anônimo',
        usuario_avatar: c.usuarios?.avatar_url,
        empresa_nome: c.empresa_nome || 'Empresa'
      })) || []

      console.log('[useComentarios] Comentários carregados:', comentarios.value.length)
      return comentarios.value
    } catch (err: any) {
      const mensagem = err.message || 'Erro ao carregar comentários'
      console.error('[useComentarios] Erro:', mensagem)
      erro.value = mensagem
      throw err
    } finally {
      carregando.value = false
    }
  }

  const criarComentario = async (sugestaoId: string, texto: string) => {
    try {
      if (!user?.value?.id) {
        throw new Error('Usuário não autenticado')
      }

      if (!texto.trim()) {
        throw new Error('Comentário não pode estar vazio')
      }

      carregando.value = true
      erro.value = null

      console.log('[useComentarios] Criando comentário para sugestão:', sugestaoId)

      // Buscar nome do usuário, empresa_id e nome da empresa
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome,
          empresa_id,
          empresas:empresa_id (
            nome
          )
        `)
        .eq('auth_user_id', user.value.id)
        .single()

      if (usuarioError || !usuarioData?.empresa_id) {
        throw new Error('Erro ao obter empresa do usuário')
      }

      const usuarioNome = usuarioData.nome || 'Anônimo'
      const empresaNome = (usuarioData.empresas as any)?.nome || 'Empresa'

      const { data, error } = await supabase
        .from('sugestoes_comentarios')
        .insert([{
          sugestao_id: sugestaoId,
          usuario_id: user.value.id,
          empresa_id: usuarioData.empresa_id,
          texto: texto.trim(),
          usuario_nome: usuarioNome,
          empresa_nome: empresaNome
        }])
        .select()

      if (error) {
        console.error('[useComentarios] Erro ao criar:', error)
        throw error
      }

      console.log('[useComentarios] Comentário criado com sucesso')

      // Contar total de comentários dessa sugestão
      const { count: totalComentarios, error: countError } = await supabase
        .from('sugestoes_comentarios')
        .select('id', { count: 'exact' })
        .eq('sugestao_id', sugestaoId)

      if (!countError && totalComentarios !== null) {
        // Atualizar contador de comentários na sugestão
        const { error: updateError } = await supabase
          .from('sugestoes')
          .update({ comentarios: totalComentarios })
          .eq('id', sugestaoId)

        if (updateError) {
          console.error('[useComentarios] Erro ao atualizar contador:', updateError)
        }
      }

      // Recarregar comentários
      await fetchComentarios(sugestaoId)
      
      return data?.[0]
    } catch (err: any) {
      const mensagem = err.message || 'Erro ao criar comentário'
      console.error('[useComentarios] Erro:', mensagem)
      erro.value = mensagem
      throw err
    } finally {
      carregando.value = false
    }
  }

  const atualizarComentario = async (comentarioId: string, sugestaoId: string, novoTexto: string) => {
    try {
      if (!novoTexto.trim()) {
        throw new Error('Comentário não pode estar vazio')
      }

      carregando.value = true
      erro.value = null

      console.log('[useComentarios] Atualizando comentário:', comentarioId)

      const { data, error } = await supabase
        .from('sugestoes_comentarios')
        .update({ 
          texto: novoTexto.trim(),
          atualizado_em: new Date().toISOString()
        })
        .eq('id', comentarioId)
        .select()

      if (error) {
        console.error('[useComentarios] Erro ao atualizar:', error)
        throw error
      }

      // Recarregar comentários
      await fetchComentarios(sugestaoId)
      
      console.log('[useComentarios] Comentário atualizado com sucesso')
      return data?.[0]
    } catch (err: any) {
      const mensagem = err.message || 'Erro ao atualizar comentário'
      console.error('[useComentarios] Erro:', mensagem)
      erro.value = mensagem
      throw err
    } finally {
      carregando.value = false
    }
  }

  const deletarComentario = async (comentarioId: string, sugestaoId: string) => {
    try {
      carregando.value = true
      erro.value = null

      console.log('[useComentarios] Deletando comentário:', comentarioId)

      const { error } = await supabase
        .from('sugestoes_comentarios')
        .delete()
        .eq('id', comentarioId)

      if (error) {
        console.error('[useComentarios] Erro ao deletar:', error)
        throw error
      }

      // Contar total de comentários dessa sugestão
      const { count: totalComentarios, error: countError } = await supabase
        .from('sugestoes_comentarios')
        .select('id', { count: 'exact' })
        .eq('sugestao_id', sugestaoId)

      if (!countError && totalComentarios !== null) {
        // Atualizar contador de comentários
        const { error: updateError } = await supabase
          .from('sugestoes')
          .update({ comentarios: totalComentarios })
          .eq('id', sugestaoId)

        if (updateError) {
          console.error('[useComentarios] Erro ao atualizar contador:', updateError)
        }
      }

      // Recarregar comentários
      await fetchComentarios(sugestaoId)

      console.log('[useComentarios] Comentário deletado com sucesso')
    } catch (err: any) {
      const mensagem = err.message || 'Erro ao deletar comentário'
      console.error('[useComentarios] Erro:', mensagem)
      erro.value = mensagem
      throw err
    } finally {
      carregando.value = false
    }
  }

  return {
    comentarios: computed(() => comentarios.value),
    carregando: computed(() => carregando.value),
    erro: computed(() => erro.value),
    fetchComentarios,
    criarComentario,
    atualizarComentario,
    deletarComentario
  }
}
