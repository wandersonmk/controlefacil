<template>
  <div class="min-h-screen bg-background">
    <!-- Conteúdo Principal -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Mensagem de Erro -->
      <div v-if="erro" class="mb-4 p-4 bg-red-500/20 border border-red-500 text-red-600 rounded-lg">
        <p class="font-semibold">Erro ao carregar sugestões:</p>
        <p class="text-sm">{{ erro }}</p>
      </div>

      <!-- Botão para recarregar -->
      <div v-if="erro" class="mb-4">
        <button
          @click="recarregar"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          🔄 Tentar novamente
        </button>
      </div>

      <!-- Estatísticas -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div class="bg-card border border-border rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-foreground">{{ stats.total }}</p>
          <p class="text-xs text-muted-foreground">Total</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-yellow-600">{{ stats.analise }}</p>
          <p class="text-xs text-muted-foreground">Em Análise</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.aceita }}</p>
          <p class="text-xs text-muted-foreground">Aceitas</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ stats.proxima }}</p>
          <p class="text-xs text-muted-foreground">Próximas</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-purple-600">{{ stats.em_desenvolvimento }}</p>
          <p class="text-xs text-muted-foreground">Em Dev</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-emerald-600">{{ stats.concluida }}</p>
          <p class="text-xs text-muted-foreground">Concluídas</p>
        </div>
      </div>

      <!-- Lista Admin -->
      <div v-if="isLoading" class="space-y-2">
        <div v-for="i in 5" :key="i" class="bg-muted rounded-lg h-40 animate-pulse" />
      </div>
      <div v-else-if="sugestoesData && sugestoesData.length > 0" class="space-y-3">
        <h2 class="text-2xl font-bold mb-4">Sugestões ({{ sugestoesData.length }} total)</h2>
        <div v-for="sug in sugestoesData" :key="sug.id" class="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg flex-1">{{ sug.titulo }}</h3>
            <span :class="getStatusBadge(sug.status)" class="px-3 py-1 rounded text-xs font-medium whitespace-nowrap ml-2">
              {{ getStatusLabel(sug.status) }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground mb-3">{{ sug.descricao }}</p>
          <div class="flex gap-4 text-xs text-muted-foreground mb-3">
            <span>📅 {{ formatarData(sug.criado_em) }}</span>
            <span>👍 {{ sug.total_curtidas || 0 }} curtidas</span>
            <span>💬 {{ sug.total_comentarios || 0 }} comentários</span>
          </div>
          
          <!-- Seletor de Status -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-t border-border pt-3">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              @click="mudarStatus(sug.id, option.value)"
              :disabled="isMudandoStatus === sug.id"
              :class="[
                'px-2 py-1.5 text-xs font-medium rounded transition-all',
                sug.status === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-muted',
                isMudandoStatus === sug.id ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12">
        <p class="text-muted-foreground">Nenhuma sugestão encontrada</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'super-admin'],
  layout: 'dashboard'
})

import { ref, computed, onMounted } from 'vue'
import { useSugestoes } from '~/composables/useSugestoes'

const { sugestoes: sugestoesData, isLoading, fetchSugestoes, getStatusLabel, atualizarStatusSugestao } = useSugestoes()
const erro = ref<string | null>(null)
const isMudandoStatus = ref<string | null>(null)

const statusOptions = [
  { value: 'analise', label: '🔍 Análise' },
  { value: 'aceita', label: '✅ Aceita' },
  { value: 'proxima', label: '⏭️ Próxima' },
  { value: 'em_desenvolvimento', label: '⚙️ Dev' },
  { value: 'concluida', label: '🎉 Concluída' },
  { value: 'recusada', label: '❌ Recusada' }
]

const stats = computed(() => {
  if (!sugestoesData.value) return {
    total: 0,
    analise: 0,
    aceita: 0,
    proxima: 0,
    em_desenvolvimento: 0,
    concluida: 0,
    recusada: 0
  }

  return {
    total: sugestoesData.value.length,
    analise: sugestoesData.value.filter((s: any) => s.status === 'analise').length,
    aceita: sugestoesData.value.filter((s: any) => s.status === 'aceita').length,
    proxima: sugestoesData.value.filter((s: any) => s.status === 'proxima').length,
    em_desenvolvimento: sugestoesData.value.filter((s: any) => s.status === 'em_desenvolvimento').length,
    concluida: sugestoesData.value.filter((s: any) => s.status === 'concluida').length,
    recusada: sugestoesData.value.filter((s: any) => s.status === 'recusada').length
  }
})

const recarregar = async () => {
  erro.value = null
  try {
    await fetchSugestoes()
  } catch (err: any) {
    erro.value = err?.message || 'Erro ao carregar sugestões'
  }
}

const getStatusBadge = (status: string): string => {
  const colors: Record<string, string> = {
    'analise': 'bg-yellow-500/20 text-yellow-600',
    'aceita': 'bg-green-500/20 text-green-600',
    'proxima': 'bg-blue-500/20 text-blue-600',
    'em_desenvolvimento': 'bg-purple-500/20 text-purple-600',
    'concluida': 'bg-emerald-500/20 text-emerald-600',
    'recusada': 'bg-red-500/20 text-red-600'
  }
  return colors[status] || 'bg-gray-500/20 text-gray-600'
}

const formatarData = (data: string): string => {
  try {
    return new Date(data).toLocaleDateString('pt-BR')
  } catch {
    return ''
  }
}

const mudarStatus = async (sugestaoId: string, novoStatus: string) => {
  isMudandoStatus.value = sugestaoId
  try {
    const sucesso = await atualizarStatusSugestao(sugestaoId, novoStatus, '')
    if (sucesso) {
      // Status atualizado com sucesso - a UI já foi atualizada localmente
      console.log('[admin-sugestoes] Status atualizado para:', novoStatus)
    }
  } catch (err: any) {
    console.error('[admin-sugestoes] Erro ao atualizar status:', err)
    erro.value = 'Erro ao atualizar status'
  } finally {
    isMudandoStatus.value = null
  }
}

onMounted(async () => {
  try {
    console.log('[admin-sugestoes] Página montada, carregando sugestões...')
    await fetchSugestoes(true) // true = isSuperAdmin
    console.log('[admin-sugestoes] Sugestões carregadas com sucesso')
  } catch (err: any) {
    const mensagem = err?.message || 'Erro desconhecido'
    console.error('[admin-sugestoes] Erro:', mensagem)
    erro.value = mensagem
  }
})
</script>
