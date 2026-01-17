<template>
  <div class="space-y-6">
    <!-- Cards de Resumo (no topo) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
      <!-- Total Entradas (Receitas) -->
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-1.5 rounded-md border border-green-200 dark:border-green-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-green-700 dark:text-green-400 text-[11px] font-medium leading-none">💰 Receitas</span>
          <span class="text-sm leading-none">📈</span>
        </div>
        <p class="text-lg font-bold text-green-700 dark:text-green-400 leading-none mb-1">
          R$ {{ formatarValor(totais.entradas) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">{{ totais.qtdEntradas }} registros</p>
      </div>

      <!-- Total Saídas (Despesas) -->
      <div class="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 p-1.5 rounded-md border border-red-200 dark:border-red-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-red-700 dark:text-red-400 text-[11px] font-medium leading-none">💸 Despesas</span>
          <span class="text-sm leading-none">📉</span>
        </div>
        <p class="text-lg font-bold text-red-700 dark:text-red-400 leading-none mb-1">
          R$ {{ formatarValor(totais.saidas) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">{{ totais.qtdSaidas }} registros</p>
      </div>

      <!-- Saldo -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-1.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-blue-700 dark:text-blue-400 text-[11px] font-medium leading-none">📊 Saldo</span>
          <span class="text-sm leading-none">💵</span>
        </div>
        <p class="text-lg font-bold leading-none mb-1" :class="totais.saldo >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'">
          R$ {{ formatarValor(totais.saldo) }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Receitas - Despesas</p>
      </div>

      <!-- Estoque -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-1.5 rounded-md border border-purple-200 dark:border-purple-800 shadow-sm">
        <div class="flex items-start justify-between mb-1">
          <span class="text-purple-700 dark:text-purple-400 text-[11px] font-medium leading-none">📦 Produtos</span>
          <span class="text-sm leading-none">🎯</span>
        </div>
        <p class="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mb-1">
          {{ totais.estoque }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-none">Itens disponíveis</p>
      </div>
    </div>

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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
// Filtros
const filtros = ref({
  dataInicial: '',
  dataFinal: ''
})

// Dados dos totais
const totais = ref({
  entradas: 0,
  saidas: 0,
  saldo: 0,
  estoque: 0,
  qtdEntradas: 0,
  qtdSaidas: 0
})

// Listas de registros
const entradas = ref<any[]>([])
const saidas = ref<any[]>([])

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
  // Em breve: buscar dados filtrados do banco
  console.log('Aplicando filtros:', filtros.value)
}

const exportarPDF = () => {
  // Em breve: exportar relatório em PDF
  console.log('Exportando para PDF')
}

const exportarExcel = () => {
  // Em breve: exportar relatório em Excel
  console.log('Exportando para Excel')
}

// Em breve: carregar dados reais do banco
onMounted(() => {
  // Exemplo de dados (será substituído por dados reais)
  // entradas.value = [...dados do banco]
  // saidas.value = [...dados do banco]
})
</script>
