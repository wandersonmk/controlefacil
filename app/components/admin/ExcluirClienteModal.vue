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

const confirmText = ref('')
const isConfirmValid = computed(() => confirmText.value.toLowerCase() === 'excluir')

const handleConfirm = () => {
  if (isConfirmValid.value) {
    emit('confirm')
  }
}

const handleClose = () => {
  confirmText.value = ''
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div class="bg-card border border-red-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Icon icon="exclamation-triangle" class-name="w-6 h-6 text-red-500" fallback="⚠️" />
          </div>
          <h3 class="text-lg font-semibold text-foreground">Excluir Cliente</h3>
        </div>
        <button
          @click="handleClose"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon icon="times" class-name="w-5 h-5" fallback="✕" />
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
            ⚠️ Atenção: Esta ação é IRREVERSÍVEL!
          </p>
          <p class="text-sm text-foreground">
            Você está prestes a excluir permanentemente o cliente:
          </p>
          <p class="text-base font-bold text-foreground mt-2">
            {{ clienteNome }}
          </p>
        </div>

        <div class="bg-muted/30 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
          <p class="font-medium text-foreground">Isso irá excluir:</p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Todos os dados do cliente</li>
            <li>Histórico de assinatura</li>
            <li>Saldo de tokens</li>
            <li>Dados vinculados no sistema</li>
          </ul>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            Para confirmar, digite <span class="font-bold text-red-500">EXCLUIR</span>
          </label>
          <input
            v-model="confirmText"
            type="text"
            placeholder="Digite EXCLUIR"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
            @keyup.enter="handleConfirm"
          />
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
          :disabled="!isConfirmValid"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
        >
          Excluir
        </button>
      </div>
    </div>
  </div>
</template>
