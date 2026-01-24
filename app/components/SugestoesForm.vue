<template>
  <div class="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-sm">
    <h3 class="text-xs sm:text-sm font-semibold text-foreground mb-3">Compartilhe sua Sugestão</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-2 sm:space-y-3">
      <!-- Categoria -->
      <div>
        <label for="categoria" class="block text-xs font-medium text-muted-foreground mb-1">
          Categoria
        </label>
        <select
          id="categoria"
          v-model="formData.categoria"
          class="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          <option value="interface">🎨 Interface/Design</option>
          <option value="funcionalidade">⚡ Nova Funcionalidade</option>
          <option value="performance">🚀 Performance</option>
          <option value="integracao">🔗 Integração</option>
          <option value="outro">💡 Outro</option>
        </select>
      </div>

      <!-- Título -->
      <div>
        <label for="titulo" class="block text-xs font-medium text-muted-foreground mb-1">
          Título da Sugestão
        </label>
        <input
          id="titulo"
          v-model="formData.titulo"
          type="text"
          placeholder="Ex: Adicionar exportação em PDF"
          maxlength="80"
          class="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
        <p class="text-xs text-muted-foreground mt-1">{{ formData.titulo.length }}/80</p>
      </div>

      <!-- Descrição -->
      <div>
        <label for="descricao" class="block text-xs font-medium text-muted-foreground mb-1">
          Descreva sua Sugestão
        </label>
        <textarea
          id="descricao"
          v-model="formData.descricao"
          placeholder="Conte mais detalhes sobre sua ideia..."
          maxlength="500"
          rows="3"
          class="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
        />
        <p class="text-xs text-muted-foreground mt-1">{{ formData.descricao.length }}/500</p>
      </div>

      <!-- Botões -->
      <div class="flex gap-2 pt-1 sm:pt-2">
        <button
          type="submit"
          :disabled="isLoading"
          class="flex-1 px-3 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isLoading ? 'Enviando...' : 'Enviar Sugestão' }}
        </button>
        <button
          type="button"
          @click="resetForm"
          :disabled="isLoading"
          class="px-3 py-2 border border-border text-foreground text-xs sm:text-sm font-medium rounded-md hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Limpar
        </button>
      </div>

      <!-- Mensagens de erro/sucesso -->
      <div v-if="errorMessage" class="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
        ❌ {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-xs text-green-700 dark:text-green-300">
        ✅ {{ successMessage }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface FormData {
  categoria: string
  titulo: string
  descricao: string
}

const formData = ref<FormData>({
  categoria: 'funcionalidade',
  titulo: '',
  descricao: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const toast = ref<any>(null)

onMounted(async () => {
  try {
    toast.value = await useToastSafe()
  } catch (err) {
    console.error('Erro ao inicializar toast:', err)
  }
})

const emit = defineEmits<{
  submitted: [data: FormData]
}>()

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!formData.value.titulo.trim() || !formData.value.descricao.trim()) {
    errorMessage.value = 'Preencha o título e descrição'
    return
  }

  isLoading.value = true
  
  try {
    // Emitir evento para o componente pai fazer o insert
    emit('submitted', { ...formData.value })
    
    // Aguardar um pouco para a ref ser atualizada
    await new Promise(resolve => setTimeout(resolve, 500))
    
    successMessage.value = 'Sugestão enviada com sucesso!'
    
    // Mostrar toast se disponível
    if (toast.value?.add) {
      toast.value.add({
        title: 'Sucesso!',
        description: 'Sua sugestão foi enviada com sucesso! 🎉',
        color: 'green'
      })
    }
    
    resetForm()
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    errorMessage.value = 'Erro ao enviar sugestão'
    console.error('Erro:', err)
    
    // Mostrar toast se disponível
    if (toast.value?.add) {
      toast.value.add({
        title: 'Erro',
        description: 'Erro ao enviar sugestão',
        color: 'red'
      })
    }
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    categoria: 'funcionalidade',
    titulo: '',
    descricao: ''
  }
  errorMessage.value = ''
}
</script>
