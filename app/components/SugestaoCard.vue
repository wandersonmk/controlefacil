<template>
  <div class="bg-card border border-border rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2 mb-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
          <!-- Categoria -->
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
            {{ getCategoriaLabel(sugestao.categoria) }}
          </span>
          <!-- Status -->
          <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', getStatusColor(sugestao.status)]">
            {{ getStatusLabel(sugestao.status) }}
          </span>
          <span class="text-xs text-muted-foreground hidden sm:inline">
            {{ formatarData(sugestao.criado_em) }}
          </span>
        </div>
        <h4 class="text-xs sm:text-sm font-semibold text-foreground break-words">
          {{ sugestao.titulo }}
        </h4>
      </div>
    </div>

    <!-- Descrição -->
    <p class="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
      {{ sugestao.descricao }}
    </p>

    <!-- Observações do Admin (se houver) -->
    <div v-if="sugestao.observacoes_admin" class="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded px-2 py-1 mb-2 sm:mb-3 text-xs text-yellow-800 dark:text-yellow-200">
      <p class="font-semibold mb-0.5">📝 Nota:</p>
      <p class="line-clamp-2">{{ sugestao.observacoes_admin }}</p>
    </div>

    <!-- Autor e Métricas -->
    <div class="flex items-center justify-between pt-2 border-t border-border">
      <span class="text-xs text-muted-foreground truncate">
        de <span class="font-medium text-foreground">{{ sugestao.empresa_nome }}</span>
      </span>
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Curtidas -->
        <button
          @click="toggleCurtida"
          class="flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs sm:text-sm"
          :class="isCurtido ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'"
        >
          <span class="text-base sm:text-lg">👍</span>
          <span class="font-medium hidden sm:inline">{{ sugestao.curtidas }}</span>
          <span class="font-medium sm:hidden text-xs">{{ sugestao.curtidas }}</span>
        </button>

        <!-- Comentários -->
        <button
          @click="abrirComentarios"
          class="flex items-center gap-1 px-2 py-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors text-xs sm:text-sm"
        >
          <span class="text-base sm:text-lg">💬</span>
          <span class="font-medium hidden sm:inline">{{ sugestao.comentarios }}</span>
          <span class="font-medium sm:hidden text-xs">{{ sugestao.comentarios }}</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de Comentários -->
  <ComentariosModal
    :sugestao-id="sugestao.id"
    :is-open="mostradorComentarios"
    @close="fecharComentarios"
    @comentario-added="handleComentarioAdicionado"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSugestoes } from '~/composables/useSugestoes'

interface Sugestao {
  id: string
  titulo: string
  descricao: string
  categoria: string
  status: string
  observacoes_admin?: string
  empresa_nome: string
  empresa_id: string
  usuario_id: string
  data_criacao: string
  criado_em: string
  curtidas: number
  comentarios: number
  ja_curtiu?: boolean
}

const props = defineProps<{
  sugestao: Sugestao
}>()

const emit = defineEmits<{
  curtir: []
  descurtir: []
  showDetails: []
  'comentario-added': []
}>()

const { getStatusLabel, getStatusColor } = useSugestoes()

const isCurtido = ref(props.sugestao.ja_curtiu || false)
const mostradorComentarios = ref(false)

// Atualizar isCurtido quando a prop mudar
watch(() => props.sugestao.ja_curtiu, (novoValor) => {
  isCurtido.value = novoValor || false
})

const toggleCurtida = () => {
  if (isCurtido.value) {
    emit('descurtir')
  } else {
    emit('curtir')
  }
  isCurtido.value = !isCurtido.value
}

const abrirComentarios = () => {
  mostradorComentarios.value = true
}

const fecharComentarios = () => {
  mostradorComentarios.value = false
}

const handleComentarioAdicionado = () => {
  emit('comentario-added')
}

const getCategoriaLabel = (categoria: string): string => {
  const labels: Record<string, string> = {
    interface: '🎨 Interface',
    funcionalidade: '⚡ Funcionalidade',
    performance: '🚀 Performance',
    integracao: '🔗 Integração',
    outro: '💡 Outro'
  }
  return labels[categoria] || categoria
}

const formatarData = (data: string): string => {
  try {
    const date = new Date(data)
    const agora = new Date()
    const diff = Math.floor((agora.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}
</script>
