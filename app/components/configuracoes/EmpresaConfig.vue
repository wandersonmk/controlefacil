<template>
  <div class="bg-card border border-border rounded-xl p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Icon icon="building" class-name="w-5 h-5 text-white" fallback="🏢" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-foreground">Dados da Empresa</h3>
        <p class="text-sm text-muted-foreground">Informações da sua empresa</p>
      </div>
    </div>

    <form @submit.prevent="salvarDados" class="space-y-4">
      <!-- Nome da Empresa -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          Nome da Empresa *
        </label>
        <AppInput
          v-model="formData.nome"
          placeholder="Digite o nome da empresa"
          required
        />
      </div>

      <!-- CNPJ -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          CNPJ
        </label>
        <input
          v-model="formData.cnpj"
          v-maska
          data-maska="##.###.###/####-##"
          placeholder="00.000.000/0000-00"
          class="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
      </div>

      <!-- WhatsApp -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          WhatsApp
        </label>
        <input
          v-model="formData.whatsapp"
          v-maska
          data-maska="(##) #####-####"
          placeholder="(00) 00000-0000"
          class="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
      </div>

      <!-- Email (somente leitura) -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          E-mail Cadastrado
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
  cnpj: '',
  whatsapp: '',
  email: ''
})

// Carregar dados da empresa
onMounted(async () => {
  if (!user.value?.id) return

  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('nome, cnpj, whatsapp, email')
      .eq('auth_user_id', user.value.id)
      .single()

    if (error) throw error

    if (data) {
      formData.value = {
        nome: data.nome || '',
        cnpj: data.cnpj || '',
        whatsapp: data.whatsapp || '',
        email: data.email || user.value.email || ''
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados da empresa:', error)
    toast?.error?.('Erro ao carregar dados da empresa')
  }
})

const salvarDados = async () => {
  if (!user.value?.id) return

  salvando.value = true

  try {
    const { error } = await supabase
      .from('empresas')
      .update({
        nome: formData.value.nome,
        cnpj: formData.value.cnpj || null,
        whatsapp: formData.value.whatsapp || null,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', user.value.id)

    if (error) throw error

    toast?.success?.('Dados da empresa atualizados com sucesso! ✅')
  } catch (error) {
    console.error('Erro ao salvar dados da empresa:', error)
    toast?.error?.('Erro ao salvar dados da empresa')
  } finally {
    salvando.value = false
  }
}
</script>
