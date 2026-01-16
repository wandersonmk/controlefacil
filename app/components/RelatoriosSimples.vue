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

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <!-- Total Entradas (Receitas) -->
      <div class="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 rounded-xl p-4 md:p-6 border border-green-200 dark:border-green-800">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <Icon icon="shopping-cart" :class-name="'w-5 h-5 md:w-6 md:h-6 text-white'" fallback="" />
          </div>
        </div>
        <h3 class="text-xs md:text-sm font-medium text-muted-foreground mb-1">💰 Receitas (Entradas)</h3>
        <p class="text-2xl md:text-3xl font-bold text-foreground">R$ {{ formatarValor(totais.entradas) }}</p>
        <p class="text-xs text-muted-foreground mt-2">{{ totais.qtdEntradas }} registros</p>
      </div>

      <!-- Total Saídas (Despesas) -->
      <div class="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-900/20 rounded-xl p-4 md:p-6 border border-red-200 dark:border-red-800">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center">
            <Icon icon="ticket" :class-name="'w-5 h-5 md:w-6 md:h-6 text-white'" fallback="" />
          </div>
        </div>
        <h3 class="text-xs md:text-sm font-medium text-muted-foreground mb-1">💸 Despesas (Saídas)</h3>
        <p class="text-2xl md:text-3xl font-bold text-foreground">R$ {{ formatarValor(totais.saidas) }}</p>
        <p class="text-xs text-muted-foreground mt-2">{{ totais.qtdSaidas }} registros</p>
      </div>

      <!-- Saldo -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 md:p-6 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <Icon icon="chart-bar" :class-name="'w-5 h-5 md:w-6 md:h-6 text-white'" fallback="" />
          </div>
        </div>
        <h3 class="text-xs md:text-sm font-medium text-muted-foreground mb-1">📊 Saldo</h3>
        <p class="text-2xl md:text-3xl font-bold text-foreground" :class="totais.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
          R$ {{ formatarValor(totais.saldo) }}
        </p>
        <p class="text-xs text-muted-foreground mt-2">Receitas - Despesas</p>
      </div>

      <!-- Estoque -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-900/20 rounded-xl p-4 md:p-6 border border-purple-200 dark:border-purple-800">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Icon icon="box" :class-name="'w-5 h-5 md:w-6 md:h-6 text-white'" fallback="" />
          </div>
        </div>
        <h3 class="text-xs md:text-sm font-medium text-muted-foreground mb-1">📦 Produtos no Estoque</h3>
        <p class="text-2xl md:text-3xl font-bold text-foreground">{{ totais.estoque }}</p>
        <p class="text-xs text-muted-foreground mt-2">Itens disponíveis</p>
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
