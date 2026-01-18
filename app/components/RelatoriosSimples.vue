<template>
  <div class="space-y-6">
    <!-- Cabeçalho com Filtros e Exportação -->
    <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
      <div class="p-6 border-b border-border">
        <div class="flex flex-col md:flex-row md:items-center justify-end gap-4">
          <!-- Botões de Exportação -->
          <div class="flex items-center gap-2">
            <button
              @click="exportarPDF"
              class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              title="Exportar para PDF"
            >
              <Icon icon="file-pdf" :class-name="'w-4 h-4'" fallback="" />
              <span class="hidden sm:inline">PDF</span>
            </button>
            <button
              @click="exportarExcel"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              title="Exportar para Excel"
            >
              <Icon icon="file-excel" :class-name="'w-4 h-4'" fallback="" />
              <span class="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="p-6 bg-muted/30">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            <!-- Campo de filtro por descrição -->
            <div class="relative flex-1 sm:flex-initial">
              <input
                v-model="filtros.descricao"
                type="text"
                placeholder="Buscar por descrição..."
                class="w-full sm:w-64 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm placeholder:text-gray-400"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <!-- Campo de filtro por data início -->
            <div class="relative flex-1 sm:flex-initial">
              <input
                v-model="filtros.dataInicial"
                type="date"
                placeholder="De"
                class="w-full sm:w-40 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <!-- Campo de filtro por data fim -->
            <div class="relative flex-1 sm:flex-initial">
              <input
                v-model="filtros.dataFinal"
                type="date"
                placeholder="Até"
                class="w-full sm:w-40 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <!-- Filtro por Tipo (Entrada/Saída) -->
            <div class="relative flex-1 sm:flex-initial">
              <select
                v-model="filtros.tipo"
                class="w-full sm:w-40 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </select>
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
            <!-- Botão Limpar Filtros -->
            <button
              @click="limparFiltros"
              :disabled="!filtros.descricao && !filtros.dataInicial && !filtros.dataFinal && !filtros.tipo"
              :class="[
                'flex items-center justify-center gap-2 px-3 py-2.5 font-medium rounded-xl transition-colors',
                filtros.descricao || filtros.dataInicial || filtros.dataFinal || filtros.tipo
                  ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
              ]"
              title="Limpar filtros"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span class="hidden sm:inline text-sm">Limpar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detalhamento de Entradas -->
    <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
      <div class="p-4 md:p-6 border-b border-border">
        <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          Detalhamento de Receitas (Entradas)
        </h3>
      </div>
      <div class="p-4 md:p-6">
        <div v-if="entradas.length === 0" class="text-center py-8">
          <Icon icon="info-circle" :class-name="'w-12 h-12 text-muted-foreground/50 mx-auto mb-4'" fallback="" />
          <p class="text-muted-foreground">Nenhuma entrada registrada no período</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="entrada in entradas"
            :key="entrada.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gradient-to-br from-green-50/30 to-emerald-50/20 dark:from-green-950/10 dark:to-emerald-950/5 rounded-lg border border-green-200/30 dark:border-green-800/20 shadow-sm hover:shadow-md transition-shadow duration-200 gap-2"
          >
            <div class="flex-1">
              <p class="font-medium text-foreground text-sm">{{ entrada.descricao }}</p>
              <p class="text-xs text-muted-foreground">{{ formatarData(entrada.data) }}</p>
            </div>
            <div class="text-right">
              <p class="text-base font-bold text-green-600 dark:text-green-400">+ R$ {{ formatarValor(entrada.valor) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detalhamento de Saídas -->
    <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
      <div class="p-4 md:p-6 border-b border-border">
        <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          Detalhamento de Despesas (Saídas)
        </h3>
      </div>
      <div class="p-4 md:p-6">
        <div v-if="saidas.length === 0" class="text-center py-8">
          <Icon icon="info-circle" :class-name="'w-12 h-12 text-muted-foreground/50 mx-auto mb-4'" fallback="" />
          <p class="text-muted-foreground">Nenhuma saída registrada no período</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="saida in saidas"
            :key="saida.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gradient-to-br from-red-50/30 to-rose-50/20 dark:from-red-950/10 dark:to-rose-950/5 rounded-lg border border-red-200/30 dark:border-red-800/20 shadow-sm hover:shadow-md transition-shadow duration-200 gap-2"
          >
            <div class="flex-1">
              <p class="font-medium text-foreground text-sm">{{ saida.descricao }}</p>
              <p class="text-xs text-muted-foreground">{{ formatarData(saida.data) }}</p>
            </div>
            <div class="text-right">
              <p class="text-base font-bold text-red-600 dark:text-red-400">- R$ {{ formatarValor(saida.valor) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Composables
const { entradas: entradasDB, fetchEntradas } = useEntradas()
const { saidas: saidasDB, fetchSaidas } = useSaidas()

// Filtros
const filtros = ref({
  descricao: '',
  dataInicial: '',
  dataFinal: '',
  tipo: '' // 'entrada' ou 'saida' ou '' para ambos
})

// Entradas e saídas filtradas
const entradas = computed(() => {
  // Se tipo for 'saida', não mostrar entradas
  if (filtros.value.tipo === 'saida') return []
  
  let dados = entradasDB.value || []
  
  // Filtro por descrição
  if (filtros.value.descricao.trim()) {
    const busca = filtros.value.descricao.toLowerCase().trim()
    dados = dados.filter((e: any) => 
      e.descricao?.toLowerCase().includes(busca)
    )
  }
  
  // Filtro por intervalo de datas
  if (filtros.value.dataInicial || filtros.value.dataFinal) {
    dados = dados.filter((e: any) => {
      const dataEntrada = e.data.split('T')[0].split(' ')[0]
      
      if (filtros.value.dataInicial && dataEntrada < filtros.value.dataInicial) {
        return false
      }
      
      if (filtros.value.dataFinal && dataEntrada > filtros.value.dataFinal) {
        return false
      }
      
      return true
    })
  }
  
  return dados
})

const saidas = computed(() => {
  // Se tipo for 'entrada', não mostrar saídas
  if (filtros.value.tipo === 'entrada') return []
  
  let dados = saidasDB.value || []
  
  // Filtro por descrição
  if (filtros.value.descricao.trim()) {
    const busca = filtros.value.descricao.toLowerCase().trim()
    dados = dados.filter((s: any) => 
      s.descricao?.toLowerCase().includes(busca)
    )
  }
  
  // Filtro por intervalo de datas
  if (filtros.value.dataInicial || filtros.value.dataFinal) {
    dados = dados.filter((s: any) => {
      const dataSaida = s.data.split('T')[0].split(' ')[0]
      
      if (filtros.value.dataInicial && dataSaida < filtros.value.dataInicial) {
        return false
      }
      
      if (filtros.value.dataFinal && dataSaida > filtros.value.dataFinal) {
        return false
      }
      
      return true
    })
  }
  
  return dados
})

// Funções
const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatarData = (data: string) => {
  const [datePart] = data.split('T')[0].split(' ')
  const [ano, mes, dia] = datePart.split('-')
  return `${dia}/${mes}/${ano}`
}

const limparFiltros = () => {
  filtros.value.descricao = ''
  filtros.value.dataInicial = ''
  filtros.value.dataFinal = ''
  filtros.value.tipo = ''
}

const exportarPDF = () => {
  // Em breve: exportar relatório em PDF
  console.log('Exportando para PDF')
}

const exportarExcel = () => {
  // Em breve: exportar relatório em Excel
  console.log('Exportando para Excel')
}

// Carregar dados do banco
onMounted(async () => {
  await Promise.all([
    fetchEntradas(),
    fetchSaidas()
  ])
})
</script>
