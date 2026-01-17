<script setup lang="ts">
import MentorMessageBubble from './MentorMessageBubble.vue'
import MentorLoadingMessage from './MentorLoadingMessage.vue'

const { messages, isSending, conversationId, fetchMessages } = useMentor()

// Ref para scroll automático
const messagesContainer = ref<HTMLElement | null>(null)

// Computed para garantir reatividade
const mensagensAtuais = computed(() => messages.value)

// Watch conversationId para carregar mensagens quando mudar
watch(conversationId, async (newId) => {
  if (newId) {
    console.log('🔄 Conversa mudou, carregando mensagens:', newId)
    await fetchMessages(newId)
  }
})

// Scroll para o final quando novas mensagens chegarem
watch(mensagensAtuais, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

// Formatar hora
const formatarHora = (dataStr: string) => {
  const data = new Date(dataStr)
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// Debug: mostrar quantas mensagens temos
watch(mensagensAtuais, (msgs) => {
  console.log('🔢 Mensagens no componente:', msgs.length, msgs)
}, { immediate: true, deep: true })
</script>

<template>
  <div class="h-full bg-card border border-border rounded-lg md:rounded-xl flex flex-col">
    <!-- Header do Chat -->
    <div class="border-b border-border p-3 md:p-4">
      <div class="flex items-center gap-2 md:gap-3">
        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm md:text-base">
          <span>&#129302;</span>
        </div>
        <div>
          <h2 class="font-semibold text-sm md:text-base">Mentor IA</h2>
          <p class="text-[10px] md:text-xs text-muted-foreground">Assistente de gestão inteligente</p>
        </div>
      </div>
    </div>

    <!-- Área de Mensagens -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 md:p-5 space-y-2">
      <!-- Mensagem de boas-vindas se não houver mensagens -->
      <div v-if="mensagensAtuais.length === 0" class="h-full flex items-center justify-center px-4">
        <div class="text-center max-w-md">
          <div class="text-5xl md:text-6xl mb-4"><span>&#129302;</span></div>
          <h3 class="text-lg md:text-xl font-semibold mb-2">Olá! Sou o Mentor IA</h3>
          <p class="text-sm md:text-base text-muted-foreground">
            Estou aqui para ajudar com precificação, combos lucrativos e gestão do seu negócio. 
            Faça sua primeira pergunta abaixo!
          </p>
        </div>
      </div>

      <!-- Mensagens -->
      <MentorMessageBubble
        v-for="msg in mensagensAtuais"
        :key="msg.id"
        :tipo="msg.role === 'user' ? 'usuario' : 'mentor'"
        :mensagem="msg.content"
        :hora="formatarHora(msg.created_at)"
      />

      <!-- Loading -->
      <MentorLoadingMessage v-if="isSending" />
    </div>
  </div>
</template>
