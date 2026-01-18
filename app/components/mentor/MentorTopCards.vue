<script setup lang="ts">
const { usage, fetchUsage, tokensCurrentSession } = useMentor()

// Buscar uso ao montar componente (apenas no cliente)
onMounted(() => {
  if (process.client) {
    fetchUsage()
  }
})

// Valores reativos do usage
const tokensDisponiveis = computed(() => usage.value?.tokensAvailable || 0)
const consumoHoje = computed(() => usage.value?.tokensToday || 0)
const consumoConversa = computed(() => tokensCurrentSession.value) // Usa contador da sessão atual

// Verificar se tokens esgotados
const tokensEsgotados = computed(() => tokensDisponiveis.value <= 0)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 mb-2">
    <!-- Card: Tokens Disponíveis -->
    <div 
      :class="[
        'p-1.5 rounded-md border shadow-sm transition-colors',
        tokensEsgotados 
          ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800' 
          : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
      ]"
    >
      <div class="flex items-start justify-between mb-1">
        <span 
          :class="[
            'text-[11px] font-medium leading-none',
            tokensEsgotados ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
          ]"
        >
          {{ tokensEsgotados ? 'Tokens Esgotados' : 'Tokens Disponíveis' }}
        </span>
        <span class="text-sm leading-none">{{ tokensEsgotados ? '⚠️' : '🎁' }}</span>
      </div>
      <p 
        :class="[
          'text-lg font-bold leading-none mb-1',
          tokensEsgotados ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
        ]"
      >
        {{ tokensDisponiveis.toLocaleString('pt-BR') }}
      </p>
      <p class="text-[9px] text-muted-foreground mb-1.5 leading-none">Renova todo mês</p>
      <NuxtLink 
        to="/tokens"
        class="inline-flex items-center justify-center gap-1 w-full px-2 py-1 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white rounded text-[10px] font-semibold transition-all shadow-md animate-pulse hover:animate-none hover:scale-105"
      >
        <span>🪙</span>
        <span>Comprar Tokens</span>
      </NuxtLink>
    </div>

    <!-- Card: Consumo em tempo real -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-1.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm">
      <div class="flex items-center justify-between">
        <span class="text-blue-700 dark:text-blue-400 text-[11px] font-medium leading-none">Consumo em tempo real</span>
        <span class="text-sm leading-none">💬</span>
      </div>
      <p class="text-lg font-bold text-blue-700 dark:text-blue-400 leading-none mt-1">
        {{ consumoConversa }} <span class="text-xs">tokens</span>
      </p>
      <p class="text-[9px] text-muted-foreground mt-0.5 leading-none">Chat atual</p>
    </div>

    <!-- Card: Consumo Hoje -->
    <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-1.5 rounded-md border border-purple-200 dark:border-purple-800 shadow-sm sm:col-span-2 lg:col-span-1">
      <div class="flex items-center justify-between">
        <span class="text-purple-700 dark:text-purple-400 text-[11px] font-medium leading-none">Consumo Hoje</span>
        <span class="text-sm leading-none">📊</span>
      </div>
      <p class="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mt-1">
        {{ consumoHoje }} <span class="text-xs">tokens</span>
      </p>
      <p class="text-[9px] text-muted-foreground mt-0.5 leading-none">Total do dia</p>
    </div>
  </div>
</template>
