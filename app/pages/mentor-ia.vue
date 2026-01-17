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

// Estado de carregamento
const isLoading = ref(true)
let authLoading: any = ref(false)
const isClient = typeof window !== 'undefined'

if (isClient) {
  // Só executa useAuth no cliente
  const auth = useAuth()
  authLoading = auth.isLoading

  onMounted(async () => {
    // Aguarda o auth loading terminar
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    // Delay adicional para garantir carregamento suave
    await new Promise(resolve => setTimeout(resolve, 500))
    isLoading.value = false
    
    // Buscar uso ao carregar página (segurança: validar tokens no servidor)
    fetchUsage()
  })
} else {
  isLoading.value = false
}
</script>

<template>
  <div>
    <!-- Loading animation -->
    <div v-if="isLoading || !isClient" class="text-center py-12 bg-muted/30 rounded-xl border border-border">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-lg font-medium text-muted-foreground">Carregando Mentor IA...</p>
      </div>
    </div>
    
    <!-- Conteúdo principal -->
    <div v-else class="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-6rem)]">
    <!-- Cards do Topo (escondido no mobile) -->
    <div class="flex-shrink-0 hidden md:block">
      <MentorTopCards />
    </div>

    <!-- Layout Principal: História + Chat -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 overflow-hidden min-h-0">
      <!-- Coluna Esquerda: Histórico de Conversas (escondido no mobile) -->
      <div class="hidden lg:block lg:col-span-1 h-full overflow-hidden">
        <MentorChatHistory />
      </div>

      <!-- Coluna Direita: Janela do Chat + Input (ocupa toda largura no mobile) -->
      <div class="lg:col-span-3 h-full flex flex-col gap-2 md:gap-3 min-h-0">
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
  </div>
</template>
