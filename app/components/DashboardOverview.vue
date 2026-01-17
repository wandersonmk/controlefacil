<template>
  <div class="max-w-7xl mx-auto">
    <!-- Cards de métricas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-6">
        <!-- Card Produtos em Estoque -->
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-1.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div class="flex items-start justify-between mb-1">
            <span class="text-blue-700 dark:text-blue-400 text-[11px] font-medium leading-none">Produtos em Estoque</span>
            <span class="text-sm leading-none">📦</span>
          </div>
          <p class="text-lg font-bold text-blue-700 dark:text-blue-400 leading-none mb-1">{{ metrics.produtosEstoque }}</p>
          <p class="text-[9px] text-muted-foreground leading-none">itens cadastrados</p>
        </div>

        <!-- Card Total de Clientes -->
        <div class="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-1.5 rounded-md border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div class="flex items-start justify-between mb-1">
            <span class="text-purple-700 dark:text-purple-400 text-[11px] font-medium leading-none">Total de Clientes</span>
            <span class="text-sm leading-none">👥</span>
          </div>
          <p class="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mb-1">{{ metrics.ticketsTotais.toLocaleString('pt-BR') }}</p>
          <p class="text-[9px] text-muted-foreground leading-none">cadastrados</p>
        </div>

        <!-- Card Entradas do Mês -->
        <div class="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-1.5 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div class="flex items-start justify-between mb-1">
            <span class="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium leading-none">Entradas do Mês</span>
            <span class="text-sm leading-none">📈</span>
          </div>
          <p class="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-none mb-1">R$ {{ metrics.entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
          <p class="text-[9px] text-muted-foreground leading-none">receita</p>
        </div>

        <!-- Card Saídas do Mês -->
        <div class="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 p-1.5 rounded-md border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div class="flex items-start justify-between mb-1">
            <span class="text-red-700 dark:text-red-400 text-[11px] font-medium leading-none">Saídas do Mês</span>
            <span class="text-sm leading-none">📉</span>
          </div>
          <p class="text-lg font-bold text-red-700 dark:text-red-400 leading-none mb-1">R$ {{ metrics.saidasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
          <p class="text-[9px] text-muted-foreground leading-none">despesas</p>
        </div>
      </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Gráfico de Performance Circular -->
  <CircularProgress :total="metrics.ticketsTotais" />

      <!-- Gráfico de Vendas Mensais -->
      <div class="relative bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20 text-card-foreground rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 overflow-hidden">
    <!-- Overlay sutil para profundidade -->
    <div class="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-100/10 to-transparent dark:via-emerald-900/5 pointer-events-none"></div>
    <h3 class="relative text-lg font-semibold text-foreground mb-4">Vendas dos Últimos Meses</h3>
        <div class="relative h-64 z-10">
          <canvas ref="lineChartRef"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
const lineChartRef = ref<HTMLCanvasElement | null>(null)

const metrics = ref({
  produtosEstoque: 0,
  entradasMes: 0,
  saidasMes: 0,
  faturamento: 0,
  ticketsTotais: 0
})
// Buscar total de clientes na tabela clientes
async function fetchTicketsTotais() {
  if (!process.client) return
  const supabase = useSupabaseClient()
  const { count, error } = await supabase
    .from('clientes')
    .select('id', { count: 'exact', head: true })
  if (!error && typeof count === 'number') {
    metrics.value.ticketsTotais = count
  }
}

// Buscar quantidade de produtos em estoque
async function fetchProdutosEstoque() {
  if (!process.client) return
  const supabase = useSupabaseClient()
  
  try {
    // Buscar empresa_id do usuário atual
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) return

    // Buscar empresa_id do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', currentUser.id)
      .single()

    if (userError || !userData?.empresa_id) return

    // Buscar produtos da empresa
    const { count, error } = await supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', userData.empresa_id)
      .eq('ativo', true)
      
    if (!error && typeof count === 'number') {
      metrics.value.produtosEstoque = count
    }
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
  }
}

// Buscar entradas do mês atual
async function fetchEntradasMes() {
  if (!process.client) return
  const supabase = useSupabaseClient()
  
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return

    const { data: userData } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', currentUser.id)
      .single()

    if (!userData?.empresa_id) return

    // Obter primeiro e último dia do mês atual
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const { data, error } = await supabase
      .from('entradas')
      .select('valor')
      .eq('empresa_id', userData.empresa_id)
      .gte('data', firstDay.toISOString())
      .lte('data', lastDay.toISOString())
      
    if (!error && data) {
      metrics.value.entradasMes = data.reduce((sum, e) => sum + Number(e.valor), 0)
    }
  } catch (err) {
    console.error('Erro ao buscar entradas do mês:', err)
  }
}

// Buscar saídas do mês atual
async function fetchSaidasMes() {
  if (!process.client) return
  const supabase = useSupabaseClient()
  
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return

    const { data: userData } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', currentUser.id)
      .single()

    if (!userData?.empresa_id) return

    // Obter primeiro e último dia do mês atual
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const { data, error } = await supabase
      .from('saidas')
      .select('valor')
      .eq('empresa_id', userData.empresa_id)
      .gte('data', firstDay.toISOString())
      .lte('data', lastDay.toISOString())
      
    if (!error && data) {
      metrics.value.saidasMes = data.reduce((sum, s) => sum + Number(s.valor), 0)
    }
  } catch (err) {
    console.error('Erro ao buscar saídas do mês:', err)
  }
}


onMounted(() => {
  nextTick(() => {
    createLineChart()
    fetchProdutosEstoque()
    fetchTicketsTotais()
    fetchEntradasMes()
    fetchSaidasMes()
  })
})


// Configuração do gráfico de linha
// Gráfico de vendas mensais (dados reais do banco)
async function createLineChart() {
  if (!lineChartRef.value) return
  if (!process.client) return
  
  const supabase = useSupabaseClient()
  const now = new Date()
  const labels = []
  const data = []
  
  try {
    // Buscar empresa_id do usuário
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return

    const { data: userData } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', currentUser.id)
      .single()

    if (!userData?.empresa_id) return

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1)
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      
      const label = d.toLocaleString('pt-BR', { month: 'short' })
      labels.push(label.charAt(0).toUpperCase() + label.slice(1))
      
      // Buscar entradas do mês
      const { data: entradasData } = await supabase
        .from('entradas')
        .select('valor')
        .eq('empresa_id', userData.empresa_id)
        .gte('data', firstDay.toISOString())
        .lte('data', lastDay.toISOString())
      
      const totalMes = entradasData?.reduce((sum, e) => sum + Number(e.valor), 0) || 0
      data.push(totalMes)
    }
  } catch (err) {
    console.error('Erro ao buscar dados do gráfico:', err)
    // Dados de fallback em caso de erro
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('pt-BR', { month: 'short' })
      labels.push(label.charAt(0).toUpperCase() + label.slice(1))
      data.push(0)
    }
  }

  const ctx = lineChartRef.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Vendas Mensais',
        data,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#059669',
        pointHoverBorderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#F3F4F6',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#F3F4F6',
          bodyColor: '#F3F4F6',
          borderColor: '#374151',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return 'Vendas: R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            }
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            },
            callback: function(value) {
              return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            }
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  })
}

// Inicializar gráficos quando o componente for montado
// ...existing code...
// ...existing code...

</script>

