<template>
  <div class="flex items-center justify-center min-h-screen">
    <AppLoading v-if="loading" message="Processando..." />
    <div v-else-if="error" class="text-center">
      <p class="text-red-500">{{ error }}</p>
      <NuxtLink to="/login" class="text-primary mt-4 inline-block">Voltar para login</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const loading = ref(true)
const error = ref('')
const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

onMounted(async () => {
  try {
    const tokenHash = route.query.token_hash as string
    const type = route.query.type as string
    const next = route.query.next as string

    if (!tokenHash) {
      error.value = 'Token inválido'
      loading.value = false
      return
    }

    // Verificar o tipo de confirmação
    if (type === 'recovery') {
      // Password recovery - trocar token por sessão
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      })

      if (verifyError) {
        console.error('Erro ao verificar token de recovery:', verifyError)
        error.value = 'Link expirado ou inválido. Solicite um novo link de redefinição.'
        loading.value = false
        return
      }

      // Redirecionar para a página de redefinição de senha
      router.push(next || '/redefinir-senha')
    } else {
      // Email confirmation (signup)
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email'
      })

      if (verifyError) {
        console.error('Erro ao verificar email:', verifyError)
        error.value = 'Link expirado ou inválido.'
        loading.value = false
        return
      }

      // Redirecionar para o dashboard
      router.push(next || '/')
    }
  } catch (err: any) {
    console.error('Erro ao processar confirmação:', err)
    error.value = err.message || 'Erro ao processar confirmação'
    loading.value = false
  }
})
</script>
