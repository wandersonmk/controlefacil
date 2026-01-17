<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Composables
const { entradas, fetchEntradas } = useEntradas()
const { saidas, fetchSaidas } = useSaidas()

// Estado de carregamento
const isLoading = ref(true)
const isLoadingData = ref(true)
let authLoading: any = ref(false)
const isClient = typeof window !== 'undefined'

// Buscar quantidade de produtos
const totalProdutos = ref(0)
const fetchProdutosCount = async () => {
  try {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', user.id)
      .single()

    if (!userData?.empresa_id) return

    const { count } = await supabase
      .from('produtos')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', userData.empresa_id)

    totalProdutos.value = count || 0
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
  }
}

// Métricas calculadas
const totalReceitas = computed(() => {
  return entradas.value
    .filter((e: any) => e.status === 'Confirmada')
    .reduce((sum: number, e: any) => sum + Number(e.valor), 0)
})

const totalDespesas = computed(() => {
  return saidas.value
    .filter((s: any) => s.status === 'Paga')
    .reduce((sum: number, s: any) => sum + Number(s.valor), 0)
})

const lucro = computed(() => {
  return totalReceitas.value - totalDespesas.value
})

if (isClient) {
  // Só executa useAuth no cliente
  const auth = useAuth()
  authLoading = auth.isLoading

  onMounted(async () => {
    // Aguarda o auth loading terminar
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    // Delay adicional para garantir carregamento suave
    await new Promise(resolve => setTimeout(resolve, 500))
    isLoading.value = false
    
    // Buscar dados reais
    await Promise.all([
      fetchEntradas(),
      fetchSaidas(),
      fetchProdutosCount()
    ])
    
    isLoadingData.value = false
  })
} else {
  isLoading.value = false
  isLoadingData.value = false
}

const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <div>
    <!-- Sempre mostra loading até o client terminar de carregar -->
    <AppLoading 
      v-if="isLoading || !isClient" 
      title="Carregando Relatórios"
      description="Preparando seus relatórios..."
    />
    <!-- Conteúdo só aparece após carregamento client-side -->
    <div v-else class="space-y-6">
      <!-- Cards de Métricas Financeiras -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
        <!-- Total Receitas -->
        <div class="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-1.5 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div class="flex items-start justify-between mb-1">
            <span class="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium leading-none">Total Receitas</span>
            <span class="text-sm leading-none">📈</span>
          </div>
          <p v-if="isLoadingData" class="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-none mb-1">...</p>
          <p v-else class="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-none mb-1">
            {{ formatarValor(totalReceitas) }}
          </p>
          <p class="text-[9px] text-muted-foreground leading-none">Entradas confirmadas</p>
        </div>

        <!-- Total Despesas -->
        <div class="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 p-1.5 rounded-md border border-red-200 dark:border-red-800 shadow-sm">
          <div class="flex items-start justify-between mb-1">
            <span class="text-red-700 dark:text-red-400 text-[11px] font-medium leading-none">Total Despesas</span>
            <span class="text-sm leading-none">📉</span>
          </div>
          <p v-if="isLoadingData" class="text-lg font-bold text-red-700 dark:text-red-400 leading-none mb-1">...</p>
          <p v-else class="text-lg font-bold text-red-700 dark:text-red-400 leading-none mb-1">
            {{ formatarValor(totalDespesas) }}
          </p>
          <p class="text-[9px] text-muted-foreground leading-none">Saídas pagas</p>
        </div>

        <!-- Lucro/Prejuízo -->
        <div :class="[
          'p-1.5 rounded-md border shadow-sm',
          lucro >= 0
            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800'
            : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800'
        ]">
          <div class="flex items-start justify-between mb-1">
            <span :class="[
              'text-[11px] font-medium leading-none',
              lucro >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'
            ]">Lucro/Prejuízo</span>
            <span class="text-sm leading-none">{{ lucro >= 0 ? '💰' : '⚠️' }}</span>
          </div>
          <p v-if="isLoadingData" :class="[
            'text-lg font-bold leading-none mb-1',
            lucro >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'
          ]">...</p>
          <p v-else :class="[
            'text-lg font-bold leading-none mb-1',
            lucro >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'
          ]">
            {{ formatarValor(lucro) }}
          </p>
          <p :class="[
            'text-[9px] leading-none',
            lucro >= 0 ? 'text-muted-foreground' : 'text-muted-foreground'
          ]">Receitas - Despesas</p>
        </div>

        <!-- Total Produtos -->
        <div class="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-1.5 rounded-md border border-purple-200 dark:border-purple-800 shadow-sm">
          <div class="flex items-start justify-between mb-1">
            <span class="text-purple-700 dark:text-purple-400 text-[11px] font-medium leading-none">Total Produtos</span>
            <span class="text-sm leading-none">📦</span>
          </div>
          <p v-if="isLoadingData" class="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mb-1">...</p>
          <p v-else class="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mb-1">
            {{ totalProdutos }}
          </p>
          <p class="text-[9px] text-muted-foreground leading-none">Produtos cadastrados</p>
        </div>
      </div>

      <!-- Relatórios de Movimentação -->
      <RelatoriosSimples />
    </div>
  </div>
</template>
