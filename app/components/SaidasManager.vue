<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Composable do Supabase
const { saidas, isLoading, fetchSaidas, addSaida, updateSaida, deleteSaida } = useSaidas()

// Estado
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingSaida = ref<any | null>(null)
const saidaToDelete = ref<any | null>(null)

// Buscar saídas ao montar
onMounted(async () => {
  await fetchSaidas()
})

// Calcular resumos
const resumo = computed(() => {
  const now = new Date()
  // Pegar data UTC para evitar problemas de timezone
  const hoje = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
  const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
  const mesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
  const anoAtras = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000)

  const diario = saidas.value
    .filter((s: any) => {
      const dataSaida = new Date(s.data)
      return dataSaida >= hoje && dataSaida < amanha && s.status === 'Paga'
    })
    .reduce((sum: number, s: any) => sum + Number(s.valor), 0)

  const semanal = saidas.value
    .filter((s: any) => new Date(s.data) >= semanaAtras && s.status === 'Paga')
    .reduce((sum: number, s: any) => sum + Number(s.valor), 0)

  const mensal = saidas.value
    .filter((s: any) => new Date(s.data) >= mesAtras && s.status === 'Paga')
    .reduce((sum: number, s: any) => sum + Number(s.valor), 0)

  const anual = saidas.value
    .filter((s: any) => new Date(s.data) >= anoAtras && s.status === 'Paga')
    .reduce((sum: number, s: any) => sum + Number(s.valor), 0)

  return { diario, semanal, mensal, anual }
})

// Ações
const abrirModalNova = () => {
  editingSaida.value = null
  showModal.value = true
}

const abrirModalEditar = (saida: any) => {
  editingSaida.value = saida
  showModal.value = true
}

const abrirModalExcluir = (saida: any) => {
  saidaToDelete.value = saida
  showDeleteModal.value = true
}

const confirmarExclusao = async () => {
  if (saidaToDelete.value) {
    await deleteSaida(saidaToDelete.value.id)
    showDeleteModal.value = false
    saidaToDelete.value = null
  }
}

const salvarSaida = async (dados: any) => {
  if (editingSaida.value) {
    // Editar
    await updateSaida(editingSaida.value.id, dados)
  } else {
    // Nova
    await addSaida(dados)
  }
  showModal.value = false
}

// Formatação
const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

const getIconeCategoria = (categoria: string) => {
  const icons: Record<string, string> = {
    'Aluguel': '🏠',
    'Água': '💧',
    'Energia': '⚡',
    'Telefone/Internet': '📱',
    'Fornecedores': '📦',
    'Pagamento Funcionário': '👤',
    'Vale Funcionário': '💵',
    'Impostos': '📄',
    'Manutenção': '🔧',
    'Outros': '💸'
  }
  return icons[categoria] || '💸'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
      <!-- Hoje -->
      <div class="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 p-1.5 rounded-md border border-red-200 dark:border-red-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-red-700 dark:text-red-400 text-[11px] font-medium leading-none">Hoje</span>
          <span class="text-sm leading-none">📅</span>
        </div>
        <p class="text-lg font-bold text-red-700 dark:text-red-400 leading-none mb-1">
          {{ formatarValor(resumo.diario) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Saídas pagas</p>
      </div>

      <!-- Semana -->
      <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-1.5 rounded-md border border-orange-200 dark:border-orange-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-orange-700 dark:text-orange-400 text-[11px] font-medium leading-none">Esta Semana</span>
          <span class="text-sm leading-none">📊</span>
        </div>
        <p class="text-lg font-bold text-orange-700 dark:text-orange-400 leading-none mb-1">
          {{ formatarValor(resumo.semanal) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Últimos 7 dias</p>
      </div>

      <!-- Mês -->
      <div class="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-1.5 rounded-md border border-rose-200 dark:border-rose-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-rose-700 dark:text-rose-400 text-[11px] font-medium leading-none">Este Mês</span>
          <span class="text-sm leading-none">📈</span>
        </div>
        <p class="text-lg font-bold text-rose-700 dark:text-rose-400 leading-none mb-1">
          {{ formatarValor(resumo.mensal) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Últimos 30 dias</p>
      </div>

      <!-- Ano -->
      <div class="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-1.5 rounded-md border border-purple-200 dark:border-purple-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-purple-700 dark:text-purple-400 text-[11px] font-medium leading-none">Este Ano</span>
          <span class="text-sm leading-none">🎯</span>
        </div>
        <p class="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mb-1">
          {{ formatarValor(resumo.anual) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Últimos 365 dias</p>
      </div>
    </div>

    <!-- Header com botão -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-foreground">Saídas</h2>
        <p class="text-sm text-muted-foreground">Gerencie suas despesas e pagamentos</p>
      </div>
      <button
        @click="abrirModalNova"
        class="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span class="hidden sm:inline">Nova Saída</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-muted-foreground mt-3">Carregando saídas...</p>
    </div>

    <!-- Lista vazia -->
    <div v-else-if="saidas.length === 0" class="text-center py-12 bg-muted/30 rounded-xl border border-border">
      <span class="text-6xl mb-4 block">📭</span>
      <p class="text-lg font-medium text-muted-foreground">Nenhuma saída registrada</p>
      <p class="text-sm text-muted-foreground mt-1">Clique em "Nova Saída" para começar</p>
    </div>

    <!-- Lista de Saídas -->
    <div v-else class="space-y-3">
      <div
        v-for="saida in saidas"
        :key="saida.id"
        class="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <span class="text-xl flex-shrink-0">{{ getIconeCategoria(saida.categoria) }}</span>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">{{ saida.descricao }}</h3>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="text-xs text-muted-foreground">{{ formatarData(saida.data) }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                  {{ saida.categoria }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {{ saida.formaPagamento }}
                </span>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    saida.status === 'Paga'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  ]"
                >
                  {{ saida.status }}
                </span>
              </div>
              <div v-if="saida.funcionario" class="mt-2 text-xs text-muted-foreground">
                👤 Funcionário: <span class="font-medium">{{ saida.funcionario }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <p class="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
              {{ formatarValor(saida.valor) }}
            </p>
            <div class="flex gap-1 flex-shrink-0">
              <button
                @click="abrirModalEditar(saida)"
                class="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                title="Editar"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="abrirModalExcluir(saida)"
                class="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                title="Excluir"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-if="saida.observacoes" class="mt-3 pt-3 border-t border-border">
          <p class="text-sm text-muted-foreground line-clamp-2">{{ saida.observacoes }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Nova/Editar Saída -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
              {{ editingSaida ? 'Editar Saída' : 'Nova Saída' }}
            </h3>
            <button
              @click="showModal = false"
              class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors p-2"
            >
              ✕
            </button>
          </div>

          <SaidaForm
            :saida="editingSaida"
            @salvar="salvarSaida"
            @cancelar="showModal = false"
          />
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Exclusão -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Confirmar Exclusão</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tem certeza que deseja excluir esta saída?
                </p>
              </div>
            </div>

            <div v-if="saidaToDelete" class="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {{ saidaToDelete.descricao }}
              </p>
              <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{{ formatarData(saidaToDelete.data) }}</span>
                <span class="font-semibold text-red-600 dark:text-red-400">
                  {{ formatarValor(saidaToDelete.valor) }}
                </span>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="showDeleteModal = false"
                class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                @click="confirmarExclusao"
                class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
