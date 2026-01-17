<script setup lang="ts">
const { sendMessage, isSending, conversationId, hasTokens } = useMentor()

const mensagem = ref('')
const showBlockedMessage = computed(() => !hasTokens.value)

watch(conversationId, () => {
  mensagem.value = ''
})

const enviarMensagem = async () => {
  if (!mensagem.value.trim() || isSending.value) return
  
  const conversationIdAtSend = conversationId.value
  const textoMensagem = mensagem.value
  mensagem.value = '' // Limpar input imediatamente
  
  try {
    await sendMessage(textoMensagem)
  } catch (error: any) {
    console.error('Erro ao enviar:', error)
    // Restaurar mensagem em caso de erro
    if (conversationId.value === conversationIdAtSend) {
      mensagem.value = textoMensagem
    }
    
    // Mostrar erro ao usuário
    alert('Erro ao enviar mensagem. Verifique sua conexão e tente novamente.')
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Enter sem Shift → Enviar
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    enviarMensagem()
  }
  // Shift + Enter → Permite quebra de linha (comportamento padrão)
}
</script>

<template>
  <div class="bg-card border-t border-border p-2 md:p-2">
    <!-- Mensagem de bloqueio -->
    <div v-if="showBlockedMessage" class="mb-2 p-2 md:p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-start gap-2">
        <span class="text-base md:text-lg">⚠️</span>
        <div class="flex-1">
          <p class="text-xs md:text-sm font-semibold text-red-700 dark:text-red-400">Tokens insuficientes</p>
          <p class="text-[10px] md:text-xs text-red-600 dark:text-red-500 mt-0.5">Aguarde a renovação mensal ou adquira tokens extras.</p>
        </div>
      </div>
    </div>

    <div class="flex gap-2 items-start">
      <!-- Textarea -->
      <div class="flex-1">
        <textarea
          v-model="mensagem"
          @keydown="handleKeydown"
          :disabled="showBlockedMessage || isSending"
          :placeholder="showBlockedMessage ? 'Tokens insuficientes' : 'Pergunte sobre precificação, combos ou gestão do seu negócio…'"
          rows="2"
          class="w-full px-3 py-2.5 md:py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>
        <p v-if="!showBlockedMessage" class="hidden md:block text-[10px] text-muted-foreground mt-0.5 px-1">
          <kbd class="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> para enviar • <kbd class="px-1 py-0.5 bg-muted rounded text-[10px]">Shift</kbd> + <kbd class="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> para nova linha
        </p>
      </div>

      <!-- Botão Enviar -->
      <button
        @click="enviarMensagem"
        :disabled="!mensagem.trim() || isSending || showBlockedMessage"
        class="px-3 md:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-1 md:gap-1.5 shadow-sm text-xs md:text-sm h-[44px] md:h-[44px]"
      >
        <span v-if="!isSending" class="hidden md:inline">Enviar</span>
        <span v-else class="hidden md:inline">Enviando...</span>
        <span class="text-lg md:text-base">📤</span>
      </button>
    </div>
  </div>
</template>
