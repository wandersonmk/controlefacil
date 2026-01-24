<template>
  <div class="bg-card border border-border rounded-lg p-4 shadow-sm">
    <h3 class="text-sm font-semibold text-foreground mb-3">Compartilhe sua Sugestão</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <!-- Categoria -->
      <div>
        <label for="categoria" class="block text-xs font-medium text-muted-foreground mb-1">
          Categoria
        </label>
        <select
          id="categoria"
          v-model="formData.categoria"
          class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          <option value="interface">Interface/Design</option>
          <option value="funcionalidade">Nova Funcionalidade</option>
          <option value="performance">Performance</option>
          <option value="integracao">Integração</option>
          <option value="outro">Outro</option>
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
          class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
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
          class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
        />
        <p class="text-xs text-muted-foreground mt-1">{{ formData.descricao.length }}/500</p>
      </div>

      <!-- Botões -->
      <div class="flex gap-2 pt-2">
        <button
          type="submit"
          class="flex-1 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          Enviar Sugestão
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-3 py-2 border border-border text-foreground text-sm font-medium rounded-md hover:bg-muted/50 transition-colors"
        >
          Limpar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const handleSubmit = () => {
  if (!formData.value.titulo.trim() || !formData.value.descricao.trim()) {
    console.warn('Preencha todos os campos')
    return
  }

  // Emitir evento para o componente pai
  // TODO: Implementar ação de banco de dados
  console.log('Sugestão a enviar:', formData.value)
  
  // Reset form after submit
  resetForm()
}

const resetForm = () => {
  formData.value = {
    categoria: 'funcionalidade',
    titulo: '',
    descricao: ''
  }
}
</script>
