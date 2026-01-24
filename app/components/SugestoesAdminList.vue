<template>
  <div class="space-y-3">
    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-2">
      <select
        v-model="filtroStatus"
        class="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Todos os Status</option>
        <option value="analise">🔍 Em Análise</option>
        <option value="aceita">✅ Aceita</option>
        <option value="proxima">⏭️ Próxima</option>
        <option value="em_desenvolvimento">⚙️ Em Desenvolvimento</option>
        <option value="concluida">🎉 Concluída</option>
        <option value="recusada">❌ Recusada</option>
      </select>

      <select
        v-model="ordenacao"
        class="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="recente">Mais Recentes</option>
        <option value="curtidas">Mais Curtidas</option>
      </select>

      <input
        v-model="busca"
        type="text"
        placeholder="Buscar sugestão..."
        class="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Lista de Sugestões Admin -->
    <div class="space-y-2">
      <div
        v-for="sugestao in sugestoesFiltradas"
        :key="sugestao.id"
        class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-foreground break-words mb-1">
              {{ sugestao.titulo }}
            </h4>
            <p class="text-xs text-muted-foreground mb-2 line-clamp-2">
              {{ sugestao.descricao }}
            </p>
            <div class="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              <span>De: <span class="font-medium text-foreground">{{ sugestao.empresa_nome }}</span></span>
              <span>•</span>
              <span>{{ getCategoriaLabel(sugestao.categoria) }}</span>
              <span>•</span>
              <span>{{ formatarData(sugestao.criado_em) }}</span>
            </div>
          </div>
          <div class="text-right">
            <span :class="getStatusColorClasses(sugestao.status)">
              {{ getStatusLabel(sugestao.status) }}
            </span>
          </div>
        </div>

        <!-- Seletor de Status -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3 pb-3 border-b border-border">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            @click="selecionarStatus(sugestao.id, status.value)"
            :class="[
              'px-2 py-1.5 text-xs font-medium rounded transition-colors',
              sugestao.status === status.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-muted'
            ]"
          >
            {{ status.label }}
          </button>
        </div>

        <!-- Campo de Observações -->
        <div class="space-y-2">
          <textarea
            :value="novasObservacoes[sugestao.id] || sugestao.observacoes_admin || ''"
            @input="novasObservacoes[sugestao.id] = ($event.target as HTMLTextAreaElement).value"
            placeholder="Adicione uma observação (opcional)..."
            rows="2"
            class="w-full px-3 py-2 text-xs border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div class="flex gap-2">
            <button
              @click="salvarStatus(sugestao.id)"
              :disabled="isSaving"
              class="flex-1 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
            <button
              @click="abrirComentarios(sugestao.id)"
              class="px-4 py-2 bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 text-xs font-medium rounded-md transition-colors"
            >
              💬 Ver ({{ sugestao.comentarios }})
            </button>
          </div>
        </div>

        <!-- Métricas -->
        <div class="flex items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <span>👍 {{ sugestao.curtidas }} curtidas</span>
          <span>💬 {{ sugestao.comentarios }} comentários</span>
        </div>
      </div>

      <div v-if="sugestoesFiltradas.length === 0" class="text-center py-8 border border-dashed border-border rounded-lg">
        <p class="text-muted-foreground text-sm">Nenhuma sugestão encontrada com os filtros aplicados.</p>
      </div>
    </div>

    <!-- Modal de Comentários -->
    <ComentariosAdminModal
      :sugestao-id="sugestaoSelecionadaId"
      :visivel="mostrarComentarios"
      @fechar="mostrarComentarios = false"
      @atualizar="recarregarSugestoes"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSugestoes } from '~/composables/useSugestoes'
import ComentariosAdminModal from '~/components/ComentariosAdminModal.vue'

interface Sugestao {
  id: string
  titulo: string
  descricao: string
  categoria: string
  status: string
  observacoes_admin?: string
  empresa_nome: string
  criado_em: string
  curtidas: number
  comentarios: number
}

const props = defineProps<{
  sugestoes: Sugestao[]
}>()

const { atualizarStatusSugestao, getStatusLabel, getStatusColor, fetchSugestoes } = useSugestoes()

const filtroStatus = ref('')
const ordenacao = ref('recente')
const busca = ref('')
const novasObservacoes = ref<Record<string, string>>({})
const isSaving = ref(false)
const mostrarComentarios = ref(false)
const sugestaoSelecionadaId = ref<string | null>(null)

const statusOptions = [
  { value: 'analise', label: '🔍 Análise' },
  { value: 'aceita', label: '✅ Aceita' },
  { value: 'proxima', label: '⏭️ Próxima' },
  { value: 'em_desenvolvimento', label: '⚙️ Dev' },
  { value: 'concluida', label: '🎉 Concluída' },
  { value: 'recusada', label: '❌ Recusada' }
]

const getStatusColorClasses = (status: string): string => {
  const colorMap: Record<string, string> = {
    analise: 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    aceita: 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    proxima: 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    em_desenvolvimento: 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    concluida: 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    recusada: 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }
  return colorMap[status] || 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
}

const sugestoesFiltradas = computed(() => {
  let filtradas = [...props.sugestoes]

  if (filtroStatus.value) {
    filtradas = filtradas.filter(s => s.status === filtroStatus.value)
  }

  if (busca.value) {
    const searchLower = busca.value.toLowerCase()
    filtradas = filtradas.filter(s =>
      s.titulo.toLowerCase().includes(searchLower) ||
      s.descricao.toLowerCase().includes(searchLower)
    )
  }

  if (ordenacao.value === 'curtidas') {
    filtradas.sort((a, b) => b.curtidas - a.curtidas)
  } else {
    filtradas.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
  }

  return filtradas
})

const selecionarStatus = (sugestaoId: string, status: string) => {
  const sugestao = props.sugestoes.find(s => s.id === sugestaoId)
  if (sugestao) {
    sugestao.status = status
  }
}

const salvarStatus = async (sugestaoId: string) => {
  const sugestao = props.sugestoes.find(s => s.id === sugestaoId)
  if (!sugestao) return

  isSaving.value = true
  const observacao = novasObservacoes.value[sugestaoId]

  const sucesso = await atualizarStatusSugestao(sugestaoId, sugestao.status, observacao)
  
  if (sucesso) {
    novasObservacoes.value[sugestaoId] = ''
  }

  isSaving.value = false
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

const abrirComentarios = (sugestaoId: string) => {
  sugestaoSelecionadaId.value = sugestaoId
  mostrarComentarios.value = true
}

const recarregarSugestoes = async () => {
  try {
    await fetchSugestoes()
  } catch (erro) {
    console.error('Erro ao recarregar sugestões:', erro)
  }
}
</script>
