<script setup lang="ts">
interface Props {
  show: boolean
  clienteNome: string
  clienteId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'confirm': []
}>()

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div class="bg-card border border-orange-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-foreground">Desativar Cliente</h3>
        </div>
        <button
          @click="handleClose"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <p class="text-sm text-orange-700 dark:text-orange-400 mb-2">
            ⚠️ Atenção!
          </p>
          <p class="text-sm text-foreground">
            Tem certeza que deseja desativar a conta de <strong>{{ clienteNome }}</strong>?
          </p>
          <p class="text-sm text-muted-foreground mt-2">
            O cliente não conseguirá mais acessar o sistema até que a conta seja reativada.
          </p>
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <button
          @click="handleClose"
          class="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Desativar Cliente
        </button>
      </div>
    </div>
  </div>
</template>
