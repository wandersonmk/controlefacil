<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const whatsappNumber = '5511914600243'
const whatsappMessage = encodeURIComponent('Olá! Minha conta no Precify App foi desativada e gostaria de entender o motivo e como posso reativá-la.')

const handleWhatsApp = () => {
  window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')
}

const handleLogout = async () => {
  const supabase = useSupabaseClient()
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4">
    <div class="max-w-md w-full">
      <div class="bg-card border border-border rounded-2xl shadow-xl p-8">
        <!-- Ícone de Alerta -->
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
        </div>

        <!-- Título -->
        <h1 class="text-2xl font-bold text-center text-foreground mb-2">
          Conta Desativada
        </h1>
        
        <p class="text-center text-muted-foreground mb-6">
          Sua conta foi desativada pela administração
        </p>

        <!-- Informação -->
        <div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
          <p class="text-sm text-orange-800 dark:text-orange-300 mb-2">
            ⚠️ <strong>O que isso significa?</strong>
          </p>
          <p class="text-sm text-orange-700 dark:text-orange-400">
            Seu acesso ao Precify App foi temporariamente suspenso. Para mais informações sobre o motivo e como reativar sua conta, entre em contato com nosso suporte.
          </p>
        </div>

        <!-- Botões de Ação -->
        <div class="space-y-3">
          <button
            @click="handleWhatsApp"
            class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Falar com Suporte</span>
          </button>

          <button
            @click="handleLogout"
            class="w-full px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
          >
            Sair da Conta
          </button>
        </div>

        <!-- Informação de Contato -->
        <div class="mt-6 pt-6 border-t border-border">
          <p class="text-xs text-center text-muted-foreground">
            WhatsApp de Suporte: <strong class="text-foreground">(11) 91460-0243</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
