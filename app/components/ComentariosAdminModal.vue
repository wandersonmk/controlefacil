<template>
  <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-card border border-border rounded-lg w-full max-w-2xl max-h-96 overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-foreground">
          💬 Comentários ({{ comentarios.length }})
        </h3>
        <button
          @click="fecharModal"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Lista de Comentários -->
      <div class="p-4 space-y-3">
        <div
          v-if="comentarios.length === 0"
          class="text-center py-8 text-muted-foreground"
        >
          Nenhum comentário ainda
        </div>

        <div
          v-for="comentario in comentarios"
          :key="comentario.id"
          class="bg-muted/50 rounded-lg p-3 space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground">
                {{ comentario.usuario_nome }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ comentario.empresa_nome }} • {{ formatarTempo(comentario.criado_em) }}
              </p>
            </div>
            <button
              @click="deletarComentario(comentario.id)"
              :disabled="deletando"
              class="px-2 py-1 text-xs bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded transition-colors disabled:opacity-50"
            >
              Deletar
            </button>
          </div>
          <p class="text-sm text-foreground break-words">{{ comentario.conteudo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useComentarios } from '~/composables/useComentarios'
import { formatarTempo } from '~/utils/formatarTempo'

interface Props {
  sugestaoId: string | null
  visivel: boolean
}

interface Comentario {
  id: string
  sugestao_id: string
  usuario_id: string
  usuario_nome: string
  empresa_nome: string
  conteudo: string
  criado_em: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  fechar: []
  atualizar: []
}>()

const comentarios = ref<Comentario[]>([])
const mostrarModal = ref(false)
const deletando = ref(false)

const { fetchComentarios, deletarComentario: deleteComentarioFromComposable } = useComentarios()

watch(() => props.visivel, async (novo) => {
  mostrarModal.value = novo
  if (novo && props.sugestaoId) {
    await carregarComentarios()
  }
})

const carregarComentarios = async () => {
  if (!props.sugestaoId) return
  try {
    const dados = await fetchComentarios(props.sugestaoId)
    comentarios.value = dados
  } catch (erro) {
    console.error('Erro ao carregar comentários:', erro)
  }
}

const deletarComentario = async (comentarioId: string) => {
  if (!confirm('Tem certeza que deseja deletar este comentário?')) return

  deletando.value = true
  try {
    // Encontrar o sugestaoId do comentário
    const comentario = comentarios.value.find((c) => c.id === comentarioId)
    if (!comentario || !props.sugestaoId) {
      throw new Error('Sugestão não encontrada')
    }

    await deleteComentarioFromComposable(comentarioId, props.sugestaoId)
    comentarios.value = comentarios.value.filter((c) => c.id !== comentarioId)
    emit('atualizar')
  } catch (erro) {
    console.error('Erro ao deletar comentário:', erro)
    alert('Erro ao deletar comentário')
  } finally {
    deletando.value = false
  }
}

const fecharModal = () => {
  mostrarModal.value = false
  emit('fechar')
}
</script>
