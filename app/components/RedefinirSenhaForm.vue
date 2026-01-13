<template>
  <div class="w-full max-w-sm mx-auto">
    <div class="rounded-xl border border-border/50 bg-secondary p-6 shadow-lg backdrop-blur-sm">
      <div class="space-y-1 mb-4">
        <h2 class="text-lg font-medium text-foreground/85">Redefinir Senha</h2>
        <p class="text-sm text-foreground/60">Digite sua nova senha abaixo</p>
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
        <AppButton type="submit" block :disabled="isLoading || !isFormValid">
          <span v-if="isLoading">Salvando...</span>
          <span v-else>Salvar nova senha</span>
        </AppButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToastSafe } from '~/composables/useToastSafe'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)
const router = useRouter()
const supabase = useSupabaseClient()

const isFormValid = computed(() => {
  return password.value.length >= 6 && confirmPassword.value === password.value
})

onMounted(() => {
  // Verificar se há acesso válido (usuário deve estar autenticado via token de recovery)
  if (process.client) {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        error.value = 'Sessão expirada. Solicite um novo link de redefinição.'
      }
    })
  }
})

async function handleSubmit() {
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

