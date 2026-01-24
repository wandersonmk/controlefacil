<template>
  <div class="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2 mb-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
            {{ getCategoriaLabel(sugestao.categoria) }}
          </span>
          <span class="text-xs text-muted-foreground">
            {{ formatarData(sugestao.data_criacao) }}
          </span>
        </div>
        <h4 class="text-sm font-semibold text-foreground break-words">
          {{ sugestao.titulo }}
        </h4>
      </div>
    </div>

    <!-- Descrição -->
    <p class="text-xs text-muted-foreground mb-3 line-clamp-2">
      {{ sugestao.descricao }}
    </p>

    <!-- Autor e Métricas -->
    <div class="flex items-center justify-between pt-2 border-t border-border">
      <span class="text-xs text-muted-foreground">
        de <span class="font-medium text-foreground">{{ sugestao.empresa_nome }}</span>
      </span>
      <div class="flex items-center gap-3">
        <!-- Curtidas -->
        <button
          @click="toggleCurtida"
          class="flex items-center gap-1 px-2 py-1 rounded transition-colors"
          :class="isCurtido ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'"
        >
          <span class="text-lg">👍</span>
          <span class="text-xs font-medium">{{ sugestao.curtidas }}</span>
        </button>

        <!-- Comentários -->
        <button
          @click="showDetails"
          class="flex items-center gap-1 px-2 py-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <span class="text-lg">💬</span>
          <span class="text-xs font-medium">{{ sugestao.comentarios }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Sugestao {
  id: string
  titulo: string
  descricao: string
  categoria: string
  empresa_nome: string
  empresa_id: string
  usuario_id: string
  data_criacao: string
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
}>()

const isCurtido = ref(props.sugestao.ja_curtiu || false)

const toggleCurtida = () => {
  if (isCurtido.value) {
    emit('descurtir')
  } else {
    emit('curtir')
  }
  isCurtido.value = !isCurtido.value
}

const showDetails = () => {
  emit('showDetails')
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
