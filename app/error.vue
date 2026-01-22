<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

// Verifica se o usuário está autenticado
const { isAuthenticated, isLoading } = useAuth()

// Páginas públicas que não precisam de autenticação
const publicPages = ['/login', '/obrigado', '/recuperar-senha', '/redefinir-senha']

// Se o erro for 404 e o usuário não estiver autenticado, redireciona para login
onMounted(async () => {
  // Aguarda o carregamento da autenticação
  let attempts = 0
  while (isLoading.value && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 50))
    attempts++
  }
  
  // Se for 404, não estiver autenticado e não for uma página pública, redireciona para login
  if (props.error.statusCode === 404 && !isAuthenticated.value) {
    const currentPath = props.error.url || ''
    const isPublicPage = publicPages.some(page => currentPath.includes(page))
    
    if (!isPublicPage) {
      console.log('[Error Page] 404 detectado sem autenticação, redirecionando para login')
      await navigateTo('/login', { replace: true })
    }
  }
})

const handleClearError = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary mb-4">
          {{ error.statusCode || '500' }}
        </h1>
        <h2 class="text-2xl font-semibold text-foreground mb-2">
          {{ error.statusCode === 404 ? 'Página não encontrada' : 'Ocorreu um erro' }}
        </h2>
        <p class="text-muted-foreground">
          {{ error.message || 'Algo deu errado' }}
        </p>
      </div>
      
      <div class="space-y-3">
        <button
          @click="handleClearError"
          class="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Voltar para a página inicial
        </button>
        
        <button
          v-if="error.statusCode === 404 && isAuthenticated"
          @click="navigateTo('/login')"
          class="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Fazer login
        </button>
      </div>
    </div>
  </div>
</template>
