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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Data Inicial</label>
            <input
              v-model="filtros.dataInicial"
              type="date"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Data Final</label>
            <input
              v-model="filtros.dataFinal"
              type="date"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="aplicarFiltros"
              class="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
            >
              Aplicar Filtros
            </button>
          </div>
          <div class="flex items-end">
            <button
              @click="limparFiltros"
              class="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-sm font-medium border border-border"
            >
              Limpar Filtros
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
        <div v-else class="space-y-3">
          <div
            v-for="entrada in entradas"
            :key="entrada.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-2"
          >
            <div class="flex-1">
              <p class="font-medium text-foreground">{{ entrada.descricao }}</p>
              <p class="text-sm text-muted-foreground">{{ formatarData(entrada.data) }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-green-600 dark:text-green-400">+ R$ {{ formatarValor(entrada.valor) }}</p>
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
        <div v-else class="space-y-3">
          <div
            v-for="saida in saidas"
            :key="saida.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-2"
          >
            <div class="flex-1">
              <p class="font-medium text-foreground">{{ saida.descricao }}</p>
              <p class="text-sm text-muted-foreground">{{ formatarData(saida.data) }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-red-600 dark:text-red-400">- R$ {{ formatarValor(saida.valor) }}</p>
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
  dataInicial: '',
  dataFinal: ''
})

// Entradas e saídas filtradas
const entradas = computed(() => {
  let dados = entradasDB.value || []
  
  if (filtros.value.dataInicial) {
    const dataInicial = new Date(filtros.value.dataInicial)
    dados = dados.filter((e: any) => new Date(e.data) >= dataInicial)
  }
  
  if (filtros.value.dataFinal) {
    const dataFinal = new Date(filtros.value.dataFinal)
    dataFinal.setHours(23, 59, 59, 999)
    dados = dados.filter((e: any) => new Date(e.data) <= dataFinal)
  }
  
  return dados
})

const saidas = computed(() => {
  let dados = saidasDB.value || []
  
  if (filtros.value.dataInicial) {
    const dataInicial = new Date(filtros.value.dataInicial)
    dados = dados.filter((s: any) => new Date(s.data) >= dataInicial)
  }
  
  if (filtros.value.dataFinal) {
    const dataFinal = new Date(filtros.value.dataFinal)
    dataFinal.setHours(23, 59, 59, 999)
    dados = dados.filter((s: any) => new Date(s.data) <= dataFinal)
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
  return new Date(data).toLocaleDateString('pt-BR')
}

const aplicarFiltros = () => {
  // Os filtros são aplicados automaticamente via computed
  console.log('Filtros aplicados:', {
    dataInicial: filtros.value.dataInicial,
    dataFinal: filtros.value.dataFinal,
    totalEntradas: entradas.value.length,
    totalSaidas: saidas.value.length
  })
}

const limparFiltros = () => {
  filtros.value.dataInicial = ''
  filtros.value.dataFinal = ''
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
