<template>
  <div class="max-w-7xl mx-auto">
    <!-- Cards de métricas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Card Produtos em Estoque -->
        <div class="relative bg-gradient-to-br from-card via-blue-950/10 to-card text-card-foreground rounded-lg border border-blue-800/20 shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 p-6 group overflow-hidden">
          <!-- Efeito de brilho sutil -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Produtos em Estoque</p>
              <p class="text-2xl font-bold text-foreground">{{ metrics.produtosEstoque }}</p>
              <p class="text-xs text-blue-600 mt-1">itens cadastrados</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Card Total de Clientes -->
        <div class="relative bg-gradient-to-br from-card via-emerald-950/10 to-card text-card-foreground rounded-lg border border-emerald-800/20 shadow-sm hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 p-6 group overflow-hidden">
          <!-- Efeito de brilho sutil -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Total de Clientes</p>
              <p class="text-2xl font-bold text-foreground">{{ metrics.ticketsTotais.toLocaleString('pt-BR') }}</p>
              <p class="text-xs text-emerald-600 mt-1">cadastrados</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <Icon :icon="['fas', 'users']" class-name="text-white text-2xl" fallback="" />
            </div>
          </div>
        </div>

        <!-- Card Entradas do Mês -->
        <div class="relative bg-gradient-to-br from-card via-green-950/10 to-card text-card-foreground rounded-lg border border-green-800/20 shadow-sm hover:shadow-md hover:shadow-green-500/10 transition-all duration-300 p-6 group overflow-hidden">
          <!-- Efeito de brilho sutil -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Entradas do Mês</p>
              <p class="text-2xl font-bold text-foreground">R$ {{ metrics.entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-xs text-green-600 mt-1">receita</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Card Saídas do Mês -->
        <div class="relative bg-gradient-to-br from-card via-red-950/10 to-card text-card-foreground rounded-lg border border-red-800/20 shadow-sm hover:shadow-md hover:shadow-red-500/10 transition-all duration-300 p-6 group overflow-hidden">
          <!-- Efeito de brilho sutil -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Saídas do Mês</p>
              <p class="text-2xl font-bold text-foreground">R$ {{ metrics.saidasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-xs text-red-600 mt-1">despesas</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Gráfico de Performance Circular -->
  <CircularProgress :total="metrics.ticketsTotais" />

      <!-- Gráfico de Vendas Mensais -->
      <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
  <h3 class="text-lg font-semibold text-foreground mb-4">Vendas dos Últimos Meses</h3>
        <div class="relative h-64">
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

