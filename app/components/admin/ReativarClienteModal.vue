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
    <div class="bg-card border border-green-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-foreground">Reativar Cliente</h3>
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
        <div class="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p class="text-sm text-green-700 dark:text-green-400 mb-2">
            ✓ Confirmação
          </p>
          <p class="text-sm text-foreground">
            Tem certeza que deseja reativar a conta de <strong>{{ clienteNome }}</strong>?
          </p>
          <p class="text-sm text-muted-foreground mt-2">
            O cliente voltará a ter acesso completo ao sistema.
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
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Reativar Cliente
        </button>
      </div>
    </div>
  </div>
</template>
