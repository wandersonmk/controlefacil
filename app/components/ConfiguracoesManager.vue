<template>
  <div class="space-y-6">
    <!-- Header com Nome e Email -->
    <div class="bg-card border border-border rounded-xl p-6">
      <div class="flex items-center gap-4">
        <!-- Info -->
        <div class="flex-1">
          <h3 class="text-xl font-bold text-foreground">{{ userData.nome || 'Usuário' }}</h3>
          <p class="text-sm text-muted-foreground">{{ userData.email }}</p>
        </div>
      </div>
    </div>

    <!-- Seção de Dados da Empresa -->
    <ConfiguracoesEmpresaConfig />

    <!-- Seção de Dados do Usuário -->
    <ConfiguracoesUsuarioConfig />
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()

const userData = ref({
  nome: '',
  email: '',
})

// Carregar dados do usuário
onMounted(async () => {
  if (!user.value?.id) return

  const supabase = useSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nome, email')
      .eq('auth_user_id', user.value.id)
      .single()

    if (error) throw error

    if (data) {
      userData.value = {
        nome: data.nome || '',
        email: data.email || user.value.email || '',
      }
    } else {
      // Fallback para o email do auth
      userData.value.email = user.value.email || ''
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error)
    // Fallback para o email do auth
    userData.value.email = user.value.email || ''
  }
})
</script>

