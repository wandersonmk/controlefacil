<script setup lang="ts">
interface Props {
  show: boolean
  clienteNome: string
  clienteId: string
  availableTokens?: number
}

const props = withDefaults(defineProps<Props>(), {
  availableTokens: 0
})

const emit = defineEmits<{
  'close': []
  'confirm': [data: { totalTokens: number, action: 'add' | 'remove' }]
}>()

const action = ref<'add' | 'remove'>('add')
const totalTokens = ref(10000)

const tokenOptions = [
  { value: 10000, label: '10.000 tokens (Free)' },
  { value: 25000, label: '25.000 tokens (Basic)' },
  { value: 50000, label: '50.000 tokens (Pro)' },
  { value: 100000, label: '100.000 tokens' },
  { value: 200000, label: '200.000 tokens (Enterprise)' },
  { value: 500000, label: '500.000 tokens' }
]

const canRemove = computed(() => {
  if (action.value === 'remove') {
    return totalTokens.value <= props.availableTokens
  }
  return true
})

const errorMessage = computed(() => {
  if (action.value === 'remove' && totalTokens.value > props.availableTokens) {
    return `Não é possível remover mais tokens do que o disponível (${props.availableTokens.toLocaleString('pt-BR')} tokens)`
  }
  return ''
})

const handleConfirm = () => {
  if (!canRemove.value) return
  emit('confirm', { totalTokens: totalTokens.value, action: action.value })
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
        <h3 class="text-lg font-semibold text-foreground">Gerenciar Tokens</h3>
        <button
          @click="emit('close')"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon icon="x" class-name="w-5 h-5" fallback="✕" />
        </button>
      </div>
      
      <p class="text-sm text-muted-foreground mb-2">
        Gerenciando tokens de <strong class="text-foreground">{{ clienteNome }}</strong>
      </p>
      
      <p class="text-xs text-muted-foreground mb-6">
        Saldo disponível: <strong class="text-foreground">{{ availableTokens.toLocaleString('pt-BR') }} tokens</strong>
      </p>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            Ação
          </label>
          <div class="flex gap-2">
            <button
              @click="action = 'add'"
              :class="[
                'flex-1 px-4 py-2 rounded-lg transition-colors font-medium',
                action === 'add' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              ]"
            >
              ➕ Adicionar
            </button>
            <button
              @click="action = 'remove'"
              :class="[
                'flex-1 px-4 py-2 rounded-lg transition-colors font-medium',
                action === 'remove' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              ]"
            >
              ➖ Remover
            </button>
          </div>
        </div>

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
        
        <div 
          v-if="errorMessage" 
          class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <p class="text-xs text-red-700 dark:text-red-400 mb-1">⚠️ Erro:</p>
          <p class="text-sm text-red-700 dark:text-red-400">
            {{ errorMessage }}
          </p>
        </div>
        
        <div 
          v-else
          :class="[
            'border rounded-lg p-4',
            action === 'add' 
              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
              : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
          ]"
        >
          <p class="text-xs mb-1" :class="action === 'add' ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'">Aviso:</p>
          <p class="text-sm" :class="action === 'add' ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'">
            <template v-if="action === 'add'">
              Isso irá <strong>adicionar {{ totalTokens.toLocaleString('pt-BR') }} tokens</strong> ao saldo atual do cliente.
            </template>
            <template v-else>
              Isso irá <strong>remover {{ totalTokens.toLocaleString('pt-BR') }} tokens</strong> do saldo atual do cliente.
            </template>
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
          :disabled="!canRemove"
          :class="[
            'flex-1 px-4 py-2 rounded-lg transition-colors font-medium',
            canRemove
              ? action === 'add'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          ]"
        >
          {{ action === 'add' ? 'Adicionar Tokens' : 'Remover Tokens' }}
        </button>
      </div>
    </div>
  </div>
</template>
