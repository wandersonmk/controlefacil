<script setup lang="ts">
interface Props {
  show: boolean
  clienteNome: string
  clienteId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'confirm': [totalTokens: number]
}>()

const totalTokens = ref(10000)

const tokenOptions = [
  { value: 10000, label: '10.000 tokens (Free)' },
  { value: 25000, label: '25.000 tokens (Basic)' },
  { value: 50000, label: '50.000 tokens (Pro)' },
  { value: 100000, label: '100.000 tokens' },
  { value: 200000, label: '200.000 tokens (Enterprise)' },
  { value: 500000, label: '500.000 tokens' }
]

const handleConfirm = () => {
  emit('confirm', totalTokens.value)
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
        <h3 class="text-lg font-semibold text-foreground">Renovar Tokens</h3>
        <button
          @click="emit('close')"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon icon="x" class-name="w-5 h-5" fallback="✕" />
        </button>
      </div>
      
      <p class="text-sm text-muted-foreground mb-6">
        Renovando tokens de <strong class="text-foreground">{{ clienteNome }}</strong>
      </p>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            Quantidade de Tokens
          </label>
          <select
            v-model="totalTokens"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option v-for="option in tokenOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="bg-muted/50 border border-border rounded-lg p-4">
          <p class="text-xs text-muted-foreground mb-1">Aviso:</p>
          <p class="text-sm text-foreground">
            Isso irá <strong>adicionar</strong> os tokens ao saldo atual do cliente.
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
