<template>
  <div class="bg-card border border-border rounded-xl p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
        <Icon icon="user" class-name="w-5 h-5 text-white" fallback="👤" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-foreground">Dados do Usuário</h3>
        <p class="text-sm text-muted-foreground">Suas informações pessoais</p>
      </div>
    </div>

    <form @submit.prevent="salvarDados" class="space-y-4">
      <!-- Nome -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          Nome Completo *
        </label>
        <AppInput
          v-model="formData.nome"
          placeholder="Digite seu nome completo"
          required
        />
      </div>

      <!-- Email (somente leitura) -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          E-mail
        </label>
        <AppInput
          :model-value="formData.email"
          disabled
          placeholder="email@exemplo.com"
          class="bg-muted/50 cursor-not-allowed"
        />
        <p class="text-xs text-muted-foreground mt-1">
          * O e-mail não pode ser alterado
        </p>
      </div>

      <!-- Botões de ação -->
      <div class="flex gap-3 pt-4">
        <AppButton
          type="submit"
          :loading="salvando"
          class="flex-1"
        >
          Salvar Alterações
        </AppButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const supabase = useSupabaseClient()
const toast = await useToastSafe()

const salvando = ref(false)

const formData = ref({
  nome: '',
  email: '',
})

// Carregar dados do usuário
onMounted(async () => {
  if (!user.value?.id) return

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nome, email')
      .eq('auth_user_id', user.value.id)
      .single()

    if (error) throw error

    if (data) {
      formData.value = {
        nome: data.nome || '',
        email: data.email || user.value.email || ''
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error)
    toast?.error?.('Erro ao carregar dados do usuário')
  }
})

const salvarDados = async () => {
  if (!user.value?.id) return

  salvando.value = true

  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nome: formData.value.nome,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', user.value.id)

    if (error) throw error

    toast?.success?.('Dados do usuário atualizados com sucesso! ✅')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profile-updated'))
    }
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error)
    toast?.error?.('Erro ao salvar dados do usuário')
  } finally {
    salvando.value = false
  }
}
</script>
