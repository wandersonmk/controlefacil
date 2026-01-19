<template>
  <div class="relative bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-cyan-50/50 dark:from-purple-950/20 dark:via-blue-950/15 dark:to-cyan-950/20 text-card-foreground rounded-lg border border-purple-200/50 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 overflow-hidden">
    <!-- Overlay sutil para profundidade -->
    <div class="absolute inset-0 bg-gradient-to-br from-transparent via-purple-100/10 to-transparent dark:via-purple-900/5 pointer-events-none"></div>
    <h3 class="relative text-lg font-semibold text-gray-900 dark:text-foreground mb-6">Visão geral de clientes</h3>

    <!-- Gráfico Circular Principal -->
    <div class="relative flex flex-col items-center mb-8">
      <div class="relative w-48 h-48 mb-6">
        <!-- Background circle -->
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120" style="overflow: visible;">
          <!-- Círculo de fundo -->
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke="#E0E7FF"
            stroke-width="8"
            fill="none"
            class="dark:stroke-indigo-900/30"
          />
          
          <!-- Círculo de progresso com gradiente -->
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke="url(#gradient)"
            stroke-width="8"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-1000 ease-out"
            style="filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))"
          />
          
          <!-- Definindo o gradiente -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#06B6D4;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
        
        <!-- Texto central -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-4xl font-bold text-foreground">{{ displayTotal }}</div>
          <div class="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">CLIENTES TOTAIS</div>
        </div>
      </div>
    </div>

    <!-- Barra de Progresso Mensal -->
    <div class="relative">
      <div class="flex justify-between text-sm mb-2">
        <span class="text-gray-600 dark:text-gray-400 uppercase tracking-wide">CLIENTES</span>
        <span class="text-foreground font-medium">{{ displayTotal }}</span>
      </div>
      <div class="relative h-3 bg-muted rounded-full overflow-hidden">
        <div 
          class="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-2000 ease-out"
          :style="{ width: `${monthlyPercentage}%` }"
        ></div>
        <!-- Indicador pontinho -->
        <div 
          class="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-purple-500 shadow-lg transition-all duration-2000 ease-out"
          :style="{ left: `calc(${monthlyPercentage}% - 8px)` }"
        ></div>
      </div>
      <div class="flex justify-center text-xs text-gray-600 dark:text-gray-400 mt-2">
        <span>Clientes atendidos em todo período</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{ total: number }>()

// Buscar dados reais de clientes
const clientesAtivos = ref(0)
const clientesInativos = ref(0)

async function fetchClientesDetalhados() {
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

    // A tabela `clientes` não possui coluna `ativo`.
    // Consideramos todos como "ativos" para fins do indicador.
    const { count } = await supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', userData.empresa_id)

    clientesAtivos.value = count || 0
    clientesInativos.value = 0
  } catch (err) {
    console.error('Erro ao buscar detalhes de clientes:', err)
  }
}

// Estados reativos para animação
const currentPercentage = ref(0)
const displayTotal = ref(0)
const monthlyPercentage = ref(0)

// Calcular percentual baseado no total de clientes
const targetPercentage = computed(() => {
  const total = props.total || 1
  return Math.min((clientesAtivos.value / total) * 100, 100)
})

// Cálculos do círculo
const radius = 40
const circumference = 2 * Math.PI * radius

// Computed para o stroke-dashoffset
const strokeDashoffset = computed(() => {
  const progress = currentPercentage.value / 100
  return circumference - (progress * circumference)
})

// Função para animar os valores
const animateProgress = () => {
  // Animar círculo principal e total de tickets
  const duration1 = 2000
  const startTime1 = Date.now()

  const animate1 = () => {
    const elapsed = Date.now() - startTime1
    const progress = Math.min(elapsed / duration1, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)

    currentPercentage.value = easeOut * targetPercentage.value
    displayTotal.value = Math.round(easeOut * (typeof props.total === 'number' ? props.total : 0))

    if (progress < 1) {
      requestAnimationFrame(animate1)
    }
  }

  // Animar barra mensal (com delay)
  setTimeout(() => {
    const duration2 = 2000
    const startTime2 = Date.now()
    const targetMonthly = Math.min((clientesAtivos.value / (props.total || 1)) * 100, 100)

    const animate2 = () => {
      const elapsed = Date.now() - startTime2
      const progress = Math.min(elapsed / duration2, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      monthlyPercentage.value = easeOut * targetMonthly

      if (progress < 1) {
        requestAnimationFrame(animate2)
      }
    }

    animate2()
  }, 800)

  animate1()
}

// Iniciar animação quando o componente for montado
onMounted(async () => {
  await fetchClientesDetalhados()
  setTimeout(() => {
    animateProgress()
  }, 300)
})
</script>

