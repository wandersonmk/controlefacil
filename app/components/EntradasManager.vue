<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Composable do Supabase
const { entradas, isLoading, fetchEntradas, addEntrada, updateEntrada, deleteEntrada } = useEntradas()

// Estado
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingEntrada = ref<any | null>(null)
const entradaToDelete = ref<any | null>(null)

// Buscar entradas ao montar
onMounted(async () => {
  await fetchEntradas()
})

// Calcular resumos
const resumo = computed(() => {
  const now = new Date()
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
  const mesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
  const anoAtras = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000)

  const diario = entradas.value
    .filter((e: any) => new Date(e.data) >= hoje && e.status === 'Confirmada')
    .reduce((sum: number, e: any) => sum + Number(e.valor), 0)

  const semanal = entradas.value
    .filter((e: any) => new Date(e.data) >= semanaAtras && e.status === 'Confirmada')
    .reduce((sum: number, e: any) => sum + Number(e.valor), 0)

  const mensal = entradas.value
    .filter((e: any) => new Date(e.data) >= mesAtras && e.status === 'Confirmada')
    .reduce((sum: number, e: any) => sum + Number(e.valor), 0)

  const anual = entradas.value
    .filter((e: any) => new Date(e.data) >= anoAtras && e.status === 'Confirmada')
    .reduce((sum: number, e: any) => sum + Number(e.valor), 0)

  return { diario, semanal, mensal, anual }
})

// Ações
const abrirModalNova = () => {
  editingEntrada.value = null
  showModal.value = true
}

const abrirModalEditar = (entrada: any) => {
  editingEntrada.value = entrada
  showModal.value = true
}

const abrirModalExcluir = (entrada: any) => {
  entradaToDelete.value = entrada
  showDeleteModal.value = true
}

const confirmarExclusao = async () => {
  if (entradaToDelete.value) {
    await deleteEntrada(entradaToDelete.value.id)
    showDeleteModal.value = false
    entradaToDelete.value = null
  }
}

const salvarEntrada = async (dados: any) => {
  if (editingEntrada.value) {
    // Editar
    await updateEntrada(editingEntrada.value.id, dados)
  } else {
    // Nova
    await addEntrada(dados)
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

const getIconeFormaPagamento = (forma: string) => {
  const icons: Record<string, string> = {
    'Pix': '🔵',
    'Dinheiro': '💵',
    'Cartão': '💳',
    'Transferência': '🏦',
    'Outro': '📄'
  }
  return icons[forma] || '💰'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
      <!-- Hoje -->
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-1.5 rounded-md border border-green-200 dark:border-green-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-green-700 dark:text-green-400 text-[11px] font-medium leading-none">Hoje</span>
          <span class="text-sm leading-none">📅</span>
        </div>
        <p class="text-lg font-bold text-green-700 dark:text-green-400 leading-none mb-1">
          {{ formatarValor(resumo.diario) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Entradas confirmadas</p>
      </div>

      <!-- Semana -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-1.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-blue-700 dark:text-blue-400 text-[11px] font-medium leading-none">Esta Semana</span>
          <span class="text-sm leading-none">📊</span>
        </div>
        <p class="text-lg font-bold text-blue-700 dark:text-blue-400 leading-none mb-1">
          {{ formatarValor(resumo.semanal) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Últimos 7 dias</p>
      </div>

      <!-- Mês -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-1.5 rounded-md border border-purple-200 dark:border-purple-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-purple-700 dark:text-purple-400 text-[11px] font-medium leading-none">Este Mês</span>
          <span class="text-sm leading-none">📈</span>
        </div>
        <p class="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mb-1">
          {{ formatarValor(resumo.mensal) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Últimos 30 dias</p>
      </div>

      <!-- Ano -->
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-1.5 rounded-md border border-amber-200 dark:border-amber-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-amber-700 dark:text-amber-400 text-[11px] font-medium leading-none">Este Ano</span>
          <span class="text-sm leading-none">🎯</span>
        </div>
        <p class="text-lg font-bold text-amber-700 dark:text-amber-400 leading-none mb-1">
          {{ formatarValor(resumo.anual) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Últimos 365 dias</p>
      </div>
    </div>

    <!-- Header com botão -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-foreground">Entradas</h2>
        <p class="text-sm text-muted-foreground">Gerencie suas entradas financeiras</p>
      </div>
      <button
        @click="abrirModalNova"
        class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span class="hidden sm:inline">Nova Entrada</span>
      </button>
    </div>

    <!-- Lista de Entradas -->
    <div v-if="isLoading" class="text-center py-12 bg-muted/30 rounded-xl border border-border">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p class="text-lg font-medium text-muted-foreground">Carregando entradas...</p>
      </div>
    </div>

    <div v-else-if="entradas.length === 0" class="text-center py-12 bg-muted/30 rounded-xl border border-border">
      <span class="text-6xl mb-4 block">📭</span>
      <p class="text-lg font-medium text-muted-foreground">Nenhuma entrada registrada</p>
      <p class="text-sm text-muted-foreground mt-1">Clique em "Nova Entrada" para começar</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="entrada in entradas"
        :key="entrada.id"
        class="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <span class="text-xl flex-shrink-0">{{ getIconeFormaPagamento(entrada.formaRecebimento) }}</span>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">{{ entrada.descricao }}</h3>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="text-xs text-muted-foreground">{{ formatarData(entrada.data) }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {{ entrada.formaRecebimento }}
                </span>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    entrada.status === 'Confirmada'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  ]"
                >
                  {{ entrada.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <p class="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              {{ formatarValor(entrada.valor) }}
            </p>
            <div class="flex gap-1 flex-shrink-0">
              <button
                @click="abrirModalEditar(entrada)"
                class="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                title="Editar"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="abrirModalExcluir(entrada)"
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

        <div v-if="entrada.observacoes" class="mt-3 pt-3 border-t border-border">
          <p class="text-sm text-muted-foreground line-clamp-2">{{ entrada.observacoes }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Nova/Editar Entrada -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
              {{ editingEntrada ? 'Editar Entrada' : 'Nova Entrada' }}
            </h3>
            <button
              @click="showModal = false"
              class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors p-2"
            >
              ✕
            </button>
          </div>

          <EntradaForm
            :entrada="editingEntrada"
            @salvar="salvarEntrada"
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
                  Tem certeza que deseja excluir esta entrada?
                </p>
              </div>
            </div>

            <div v-if="entradaToDelete" class="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {{ entradaToDelete.descricao }}
              </p>
              <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{{ formatarData(entradaToDelete.data) }}</span>
                <span class="font-semibold text-emerald-600 dark:text-emerald-400">
                  {{ formatarValor(entradaToDelete.valor) }}
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
