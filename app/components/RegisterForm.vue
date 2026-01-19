<script setup lang="ts">
import { ref, computed } from 'vue'

const name = ref('')
const companyName = ref('')
const whatsapp = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Função para formatar WhatsApp
const formatWhatsApp = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

const handleWhatsAppInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const formatted = formatWhatsApp(input.value)
  whatsapp.value = formatted
  input.value = formatted
}
let toast: any
onMounted(async () => {
  toast = await useToastSafe()
})

const { signUp, isLoading, errorMessage } = useAuth()

// Validações em tempo real
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isEmailValid = computed(() => {
  if (!email.value) return true // Não mostra erro se estiver vazio
  return emailRegex.test(email.value)
})

const emailError = computed(() => {
  if (!email.value || isEmailValid.value) return ''
  return 'Email inválido'
})

// Validação de WhatsApp
const isWhatsAppValid = computed(() => {
  if (!whatsapp.value) return true // Não mostra erro se estiver vazio
  const cleanPhone = whatsapp.value.replace(/\D/g, '')
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
})

const whatsappError = computed(() => {
  if (!whatsapp.value || isWhatsAppValid.value) return ''
  return 'WhatsApp inválido (ex: 11999999999)'
})

const passwordsMatch = computed(() => {
  if (!password.value || !confirmPassword.value) return true // Não mostra erro se estiver vazio
  return password.value === confirmPassword.value
})

const passwordError = computed(() => {
  if (!confirmPassword.value || passwordsMatch.value) return ''
  return 'As senhas não coincidem'
})

const isPasswordStrong = computed(() => {
  if (!password.value) return true // Não mostra erro se estiver vazio
  return password.value.length >= 6
})

const passwordStrengthError = computed(() => {
  if (!password.value || isPasswordStrong.value) return ''
  return 'A senha deve ter pelo menos 6 caracteres'
})

async function handleRegister() {
  if (!name.value || !companyName.value || !whatsapp.value || !email.value || !password.value || !confirmPassword.value) {
    toast?.warning('Preencha todos os campos')
    return
  }
  
  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    toast?.error('Digite um email válido')
    return
  }

  // Validação de WhatsApp
  const cleanPhone = whatsapp.value.replace(/\D/g, '')
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    toast?.error('Digite um WhatsApp válido')
    return
  }
  
  // Validação de confirmação de senha
  if (password.value !== confirmPassword.value) {
    toast?.error('As senhas não coincidem')
    return
  }
  
  if (password.value.length < 6) {
    toast?.error('A senha deve ter pelo menos 6 caracteres')
    return
  }
  
  try {
    // 1. Verificar se email já existe
    toast?.info('Verificando disponibilidade...')
    const { exists } = await $fetch('/api/auth/check-email', {
      method: 'POST',
      body: { email: email.value }
    })

    if (exists) {
      toast?.error('Este email já está cadastrado. Faça login ou use outro email.')
      return
    }

    // 2. Criar conta (sem confirmação de email)
    toast?.info('Criando sua conta...')
    const user = await signUp({
      name: name.value,
      companyName: companyName.value,
      whatsapp: cleanPhone,
      email: email.value,
      password: password.value
    })

    if (!user) {
      toast?.error(errorMessage.value || 'Erro ao criar conta')
      return
    }

    // 3. Login automático (Supabase já faz isso no signUp quando não tem confirmação)
    toast?.success('Conta criada com sucesso! Entrando...')
    
    // Aguardar um pouco para garantir que o trigger criou empresa/usuário
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 4. Redirecionar para dashboard
    await navigateTo('/')
    
  } catch (error: any) {
    console.error('Erro no cadastro:', error)
    toast?.error(error?.message || 'Erro ao criar conta. Tente novamente.')
  }
}
</script>

<template>
  <div class="w-full">
    <div class="relative rounded-xl bg-secondary p-6 lg:p-8 shadow overflow-hidden">
      <!-- Borda animada com gradiente -->
      <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 via-pink-600 to-orange-500 opacity-100 animate-gradient bg-[length:200%_auto]"></div>
      <div class="absolute inset-[2px] rounded-xl bg-secondary"></div>
      
      <!-- Conteúdo -->
      <div class="relative z-10">
        <div class="space-y-1">
          <h2 class="text-xl font-semibold">Criar nova conta</h2>
          <p class="text-sm text-muted-foreground">Preencha os dados para se cadastrar</p>
        </div>

        <form @submit.prevent="handleRegister" class="mt-6 space-y-3">
      <AppInput
        v-model="name"
        type="text"
        placeholder="Nome completo"
        autocomplete="name"
        required
        :valid="!!name"
      />
      
      <AppInput
        v-model="companyName"
        type="text"
        placeholder="Nome da empresa"
        autocomplete="organization"
        required
        :valid="!!companyName"
      />

      <div>
        <AppInput
          v-model="whatsapp"
          type="tel"
          placeholder="WhatsApp (11) 99999-9999"
          autocomplete="tel"
          maxlength="15"
          required
          @input="handleWhatsAppInput"
          :invalid="!!whatsappError"
          :valid="!!whatsapp && isWhatsAppValid"
        />
        <div v-if="whatsappError" class="text-xs text-red-500 mt-1 px-1">
          {{ whatsappError }}
        </div>
      </div>
      
      <div>
        <AppInput
          v-model="email"
          type="email"
          placeholder="Email"
          autocomplete="email"
          required
          :invalid="!!emailError"
          :valid="!!email && isEmailValid"
        />
        <div v-if="emailError" class="text-xs text-red-500 mt-1 px-1">
          {{ emailError }}
        </div>
      </div>
      
      <div>
        <AppInput
          v-model="password"
          type="password"
          placeholder="Senha"
          autocomplete="new-password"
          required
          :invalid="!!passwordStrengthError"
          :valid="!!password && isPasswordStrong"
        />
        <div v-if="passwordStrengthError" class="text-xs text-red-500 mt-1 px-1">
          {{ passwordStrengthError }}
        </div>
      </div>
      
      <div>
        <AppInput
          v-model="confirmPassword"
          type="password"
          placeholder="Confirmar senha"
          autocomplete="new-password"
          required
          :invalid="!!passwordError"
          :valid="!!confirmPassword && passwordsMatch && !!password"
        />
        <div v-if="passwordError" class="text-xs text-red-500 mt-1 px-1">
          {{ passwordError }}
        </div>
      </div>
      
      <!-- Placeholder para mensagens de erro - será implementado futuramente -->
      <!-- <div v-if="errorMessage" class="text-sm text-red-500 bg-red-50 p-2 rounded">
        {{ errorMessage }}
      </div> -->
      
      <AppButton 
        type="submit" 
        block 
        :disabled="isLoading || !name || !companyName || !whatsapp || !email || !password || !confirmPassword || !isEmailValid || !isWhatsAppValid || !passwordsMatch || !isPasswordStrong"
      >
        <span v-if="isLoading">Criando conta...</span>
        <span v-else>Criar conta</span>
      </AppButton>
        </form>
      </div>
    </div>
  </div>
</template>

