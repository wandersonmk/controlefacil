<script setup lang="ts">
interface Props {
  show: boolean
  clienteNome: string
  clienteId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'confirm': [plan: string, period: string]
}>()

const selectedPeriod = ref<'trial' | '1month' | '6months' | '12months'>('1month')

// Mapeamento automático: Período → Plano + Tokens
const periodPlanMap = {
  trial: { plan: 'free', label: 'Gratuito', tokens: 10000 },
  '1month': { plan: 'basic', label: 'Básico', tokens: 100000 },
  '6months': { plan: 'pro', label: 'Pro', tokens: 250000 },
  '12months': { plan: 'enterprise', label: 'Enterprise', tokens: 500000 }
}

const periods = [
  { value: 'trial', label: 'Trial (7 dias)', plan: 'Gratuito', tokens: '10.000' },
  { value: '1month', label: '1 Mês', plan: 'Básico', tokens: '100.000' },
  { value: '6months', label: '6 Meses', plan: 'Pro', tokens: '250.000' },
  { value: '12months', label: '12 Meses', plan: 'Enterprise', tokens: '500.000' }
]

// Plano selecionado automaticamente com base no período
const selectedPlanInfo = computed(() => periodPlanMap[selectedPeriod.value])

const handleConfirm = () => {
  emit('confirm', selectedPlanInfo.value.plan, selectedPeriod.value)
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="emit('close')"
  >
    <div class="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-foreground">Renovar Assinatura</h3>
        <button
          @click="emit('close')"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon icon="x" class-name="w-5 h-5" fallback="✕" />
        </button>
      </div>
      
      <p class="text-sm text-muted-foreground mb-6">
        Renovando assinatura de <strong class="text-foreground">{{ clienteNome }}</strong>
      </p>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            Período
          </label>
          <select
            v-model="selectedPeriod"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option v-for="period in periods" :key="period.value" :value="period.value">
              {{ period.label }} - {{ period.plan }} ({{ period.tokens }} tokens)
            </option>
          </select>
        </div>
        
        <div class="bg-muted/50 border border-border rounded-lg p-4">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Plano selecionado:</span>
              <span class="font-semibold text-foreground">{{ selectedPlanInfo.label }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Tokens a adicionar:</span>
              <span class="font-semibold text-green-600">+{{ selectedPlanInfo.tokens.toLocaleString() }}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p class="text-xs text-blue-600 dark:text-blue-400">
            💡 Os tokens serão <strong>somados</strong> ao saldo atual do cliente.
          </p>
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <button
          @click="emit('close')"
          class="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>
