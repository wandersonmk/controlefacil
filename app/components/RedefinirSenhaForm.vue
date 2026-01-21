<template>
  <div class="w-full max-w-sm mx-auto">
    <div class="rounded-xl border border-border/50 bg-secondary p-6 shadow-lg backdrop-blur-sm">
      <div class="space-y-1 mb-4">
        <h2 class="text-lg font-medium text-white">Redefinir Senha</h2>
        <p class="text-sm text-gray-300">Digite sua nova senha abaixo</p>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <AppInput
          v-model="password"
          type="password"
          placeholder="Nova senha"
          autocomplete="new-password"
          required
          :valid="!!password && password.length >= 6"
        />
        <AppInput
          v-model="confirmPassword"
          type="password"
          placeholder="Confirmar nova senha"
          autocomplete="new-password"
          required
          :valid="!!confirmPassword && confirmPassword === password"
        />
        <div v-if="error" class="text-xs text-red-500 mt-1 px-1">{{ error }}</div>
        <AppButton 
          type="submit" 
          block 
          :disabled="isLoading || !isFormValid"
          class="!bg-purple-600 hover:!bg-purple-700 !text-white"
        >
          <span v-if="isLoading">Salvando...</span>
          <span v-else>Salvar nova senha</span>
        </AppButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToastSafe } from '~/composables/useToastSafe'

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)
const router = useRouter()
const route = useRoute()

// Inicializar supabase apenas no cliente
let supabase: any = null
if (process.client) {
  const { useSupabaseClient } = await import('~/composables/useSupabaseClient')
  supabase = useSupabaseClient()
}

const isFormValid = computed(() => {
  return password.value.length >= 6 && confirmPassword.value === password.value
})

onMounted(async () => {
  if (!supabase) return
  
  // O Supabase redireciona com access_token e refresh_token no hash (#)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  const type = hashParams.get('type')
  
  if (type === 'recovery' && accessToken && refreshToken) {
    // Estabelecer a sessão com os tokens recebidos
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
    
    if (sessionError) {
      console.error('Erro ao estabelecer sessão:', sessionError)
      error.value = 'Link inválido ou expirado. Solicite um novo link de redefinição.'
    }
    
    // Limpar hash da URL
    window.history.replaceState(null, '', window.location.pathname)
  } else {
    // Verificar se já existe uma sessão válida
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      error.value = 'Sessão expirada. Solicite um novo link de redefinição.'
    }
  }
})

async function handleSubmit() {
  if (!supabase) {
    error.value = 'Erro ao conectar com o serviço.'
    return
  }
  
  error.value = ''
  if (!isFormValid.value) {
    error.value = 'Preencha corretamente os campos.'
    return
  }
  
  isLoading.value = true
  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })
    
    if (updateError) {
      throw updateError
    }
    
    // Toast de sucesso
    const toast = await useToastSafe()
    if (toast) {
      toast.success('Senha alterada com sucesso!')
    } else {
      alert('Senha alterada com sucesso!')
    }
    
    // Deslogar e redirecionar para login
    await supabase.auth.signOut()
    router.push('/login')
  } catch (err: any) {
    error.value = err.message || 'Erro ao redefinir senha. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

