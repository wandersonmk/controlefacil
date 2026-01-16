<script setup lang="ts">
import MentorTopCards from '~/components/mentor/MentorTopCards.vue'
import MentorChatHistory from '~/components/mentor/MentorChatHistory.vue'
import MentorChatWindow from '~/components/mentor/MentorChatWindow.vue'
import MentorChatInput from '~/components/mentor/MentorChatInput.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { fetchUsage } = useMentor()

// Buscar uso ao carregar página (segurança: validar tokens no servidor)
onMounted(() => {
  if (process.client) {
    fetchUsage()
  }
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)]">
    <!-- Cards do Topo -->
    <div class="flex-shrink-0">
      <MentorTopCards />
    </div>

    <!-- Layout Principal: História + Chat -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 overflow-hidden min-h-0">
      <!-- Coluna Esquerda: Histórico de Conversas -->
      <div class="lg:col-span-1 h-full overflow-hidden">
        <MentorChatHistory />
      </div>

      <!-- Coluna Direita: Janela do Chat + Input -->
      <div class="lg:col-span-3 h-full flex flex-col gap-3 min-h-0">
        <!-- Janela do Chat -->
        <div class="flex-1 overflow-hidden min-h-0">
          <MentorChatWindow />
        </div>

        <!-- Input de Mensagem -->
        <div class="flex-shrink-0">
          <MentorChatInput />
        </div>
      </div>
    </div>
  </div>
</template>
