<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-card rounded-none sm:rounded-lg shadow-xl max-w-3xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
        <h3 class="text-lg font-semibold text-foreground">
          {{ fornecedor ? 'Editar Fornecedor Parceiro' : 'Novo Fornecedor Parceiro' }}
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Nome e Empresa -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nome do Contato *</label>
            <input
              v-model="form.nome"
              type="text"
              required
              placeholder="Ex: João Silva"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nome da Empresa *</label>
            <input
              v-model="form.empresa"
              type="text"
              required
              placeholder="Ex: Fornecedor LTDA"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- CNPJ e Categoria -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">CNPJ</label>
            <input
              v-model="form.cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Categoria *</label>
            <input
              v-model="form.categoria"
              type="text"
              required
              placeholder="Ex: Hortifruti, Carnes, Bebidas..."
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- Telefone e WhatsApp -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Telefone *</label>
            <input
              v-model="form.telefone"
              type="text"
              required
              placeholder="(00) 00000-0000"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">WhatsApp</label>
            <input
              v-model="form.whatsapp"
              type="text"
              placeholder="(00) 00000-0000"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- Email e Site -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="contato@fornecedor.com.br"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Site</label>
            <input
              v-model="form.site"
              type="url"
              placeholder="https://fornecedor.com.br"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- Estado e Cidade -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Estado *</label>
            <input
              v-model="form.estado"
              type="text"
              required
              placeholder="Ex: SP"
              maxlength="2"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring uppercase"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Cidade *</label>
            <input
              v-model="form.cidade"
              type="text"
              required
              placeholder="Ex: São Paulo"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- Endereço -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Endereço</label>
          <input
            v-model="form.endereco"
            type="text"
            placeholder="Rua, número, bairro"
            class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <!-- Logo URL -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">URL da Logo</label>
          <input
            v-model="form.logo_url"
            type="url"
            placeholder="https://..."
            class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Descrição</label>
          <textarea
            v-model="form.descricao"
            rows="3"
            placeholder="Descreva o fornecedor e seus produtos/serviços..."
            class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <!-- Destaque -->
        <div class="flex items-center space-x-2">
          <input
            v-model="form.destaque"
            type="checkbox"
            id="destaque"
            class="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-ring"
          />
          <label for="destaque" class="text-sm font-medium text-foreground">
            Fornecedor em destaque (aparecerá no topo da lista)
          </label>
        </div>

        <!-- Botões -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {{ fornecedor ? 'Salvar Alterações' : 'Adicionar Fornecedor' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FornecedorParceiro } from '@/shared/types/FornecedorParceiro'

const props = defineProps<{
  show: boolean
  fornecedor?: FornecedorParceiro | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: any]
}>()

const form = ref({
  nome: '',
  empresa: '',
  cnpj: '',
  categoria: '',
  email: '',
  telefone: '',
  whatsapp: '',
  endereco: '',
  cidade: '',
  estado: '',
  descricao: '',
  site: '',
  logo_url: '',
  destaque: false
})

// Watch para popular o formulário ao editar
watch(() => props.fornecedor, (fornecedor) => {
  if (fornecedor) {
    form.value = {
      nome: fornecedor.nome,
      empresa: fornecedor.empresa,
      cnpj: fornecedor.cnpj || '',
      categoria: fornecedor.categoria,
      email: fornecedor.email || '',
      telefone: fornecedor.telefone,
      whatsapp: fornecedor.whatsapp || '',
      endereco: fornecedor.endereco || '',
      cidade: fornecedor.cidade,
      estado: fornecedor.estado,
      descricao: fornecedor.descricao || '',
      site: fornecedor.site || '',
      logo_url: fornecedor.logo_url || '',
      destaque: fornecedor.destaque
    }
  } else {
    // Reset form
    form.value = {
      nome: '',
      empresa: '',
      cnpj: '',
      categoria: '',
      email: '',
      telefone: '',
      whatsapp: '',
      endereco: '',
      cidade: '',
      estado: '',
      descricao: '',
      site: '',
      logo_url: '',
      destaque: false
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  // Validação básica
  if (!form.value.nome || !form.value.empresa || !form.value.categoria || 
      !form.value.telefone || !form.value.cidade || !form.value.estado) {
    return
  }

  emit('confirm', form.value)
}
</script>
