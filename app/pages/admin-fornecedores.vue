<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'super-admin'],
  layout: 'dashboard'
})

import type { FornecedorParceiro } from '@/shared/types/FornecedorParceiro'

const { 
  fornecedoresParceiros,
  isLoading,
  error,
  estados,
  cidades,
  fetchFornecedoresParceirosAdmin,
  addFornecedorParceiro,
  updateFornecedorParceiro,
  deleteFornecedorParceiro
} = useFornecedoresParceiros()

const toast = await useToastSafe()

// Estados do componente
const showModal = ref(false)
const showExcluirModal = ref(false)
const fornecedorEditando = ref<FornecedorParceiro | null>(null)
const fornecedorParaExcluir = ref<FornecedorParceiro | null>(null)
const searchQuery = ref('')
const filterEstado = ref('all')
const filterCidade = ref('all')

// Carregar fornecedores ao montar
onMounted(() => {
  fetchFornecedoresParceirosAdmin()
})

// Fornecedores filtrados
const fornecedoresFiltrados = computed(() => {
  let filtered = fornecedoresParceiros.value

  // Filtrar por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(f => 
      f.nome.toLowerCase().includes(query) ||
      f.empresa.toLowerCase().includes(query) ||
      f.categoria.toLowerCase().includes(query) ||
      f.cidade.toLowerCase().includes(query) ||
      f.telefone.includes(query)
    )
  }

  // Filtrar por estado
  if (filterEstado.value !== 'all') {
    filtered = filtered.filter(f => f.estado === filterEstado.value)
  }

  // Filtrar por cidade
  if (filterCidade.value !== 'all') {
    filtered = filtered.filter(f => f.cidade === filterCidade.value)
  }

  return filtered
})

// Handlers
const handleNovo = () => {
  fornecedorEditando.value = null
  showModal.value = true
}

const handleEditar = (fornecedor: FornecedorParceiro) => {
  fornecedorEditando.value = fornecedor
  showModal.value = true
}

const handleExcluir = (fornecedor: FornecedorParceiro) => {
  fornecedorParaExcluir.value = fornecedor
  showExcluirModal.value = true
}

const confirmarExclusao = async () => {
  if (!fornecedorParaExcluir.value) return

  const sucesso = await deleteFornecedorParceiro(fornecedorParaExcluir.value.id)
  if (sucesso) {
    toast?.success?.('Fornecedor parceiro excluído com sucesso!')
    showExcluirModal.value = false
    fornecedorParaExcluir.value = null
  } else {
    toast?.error?.('Erro ao excluir fornecedor parceiro')
  }
}

const confirmModal = async (dados: any) => {
  let sucesso = false

  if (fornecedorEditando.value) {
    // Editar
    sucesso = await updateFornecedorParceiro(fornecedorEditando.value.id, dados)
    if (sucesso) {
      toast?.success?.('Fornecedor parceiro atualizado com sucesso!')
    }
  } else {
    // Criar novo
    sucesso = await addFornecedorParceiro(dados)
    if (sucesso) {
      toast?.success?.('Fornecedor parceiro adicionado com sucesso!')
    }
  }

  if (sucesso) {
    showModal.value = false
    fornecedorEditando.value = null
  } else {
    toast?.error?.('Erro ao salvar fornecedor parceiro')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Fornecedores Parceiros</h1>
          <p class="text-sm text-muted-foreground mt-1">
            Gerencie fornecedores parceiros disponíveis para todos os lojistas
          </p>
        </div>
        <NuxtLink
          to="/admin"
          class="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          ← Voltar ao Admin
        </NuxtLink>
      </div>

      <!-- Stats Card -->
      <div class="bg-card border border-border rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total de Fornecedores Parceiros</p>
            <p class="text-3xl font-bold text-foreground mt-1">{{ fornecedoresParceiros.length }}</p>
          </div>
          <button
            @click="handleNovo"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Novo Fornecedor</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-card border border-border rounded-xl p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Buscar
            </label>
            <div class="relative">
              <Icon 
                icon="search" 
                class-name="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" 
                fallback="🔍"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nome, empresa, categoria..."
                class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Filtrar por Estado
            </label>
            <select
              v-model="filterEstado"
              class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os estados</option>
              <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Filtrar por Cidade
            </label>
            <select
              v-model="filterCidade"
              class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas as cidades</option>
              <option v-for="cidade in cidades" :key="cidade" :value="cidade">{{ cidade }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12 bg-muted/30 rounded-xl border border-border">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p class="text-lg font-medium text-muted-foreground">Carregando fornecedores...</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-500">
        {{ error }}
      </div>

      <!-- Tabela -->
      <div v-else class="bg-card border border-border rounded-xl overflow-hidden">
        <!-- Empty State -->
        <div v-if="fornecedoresFiltrados.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum fornecedor encontrado</h3>
          <p class="text-muted-foreground">Adicione o primeiro fornecedor parceiro.</p>
        </div>

        <!-- Desktop Table -->
        <div v-else class="hidden lg:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/30">
              <tr class="border-b border-border">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Fornecedor</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Categoria</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Localização</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Contato</th>
                <th class="text-right py-3 px-4 font-medium text-muted-foreground text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="fornecedor in fornecedoresFiltrados" 
                :key="fornecedor.id"
                class="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <!-- Fornecedor -->
                <td class="py-3 px-4">
                  <div class="flex items-center">
                    <div v-if="fornecedor.logo_url" class="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      <img :src="fornecedor.logo_url" :alt="fornecedor.empresa" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-foreground">{{ fornecedor.empresa }}</p>
                      <p class="text-xs text-muted-foreground">{{ fornecedor.nome }}</p>
                      <span v-if="fornecedor.destaque" class="inline-block mt-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
                        ⭐ Destaque
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Categoria -->
                <td class="py-3 px-4">
                  <span class="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    {{ fornecedor.categoria }}
                  </span>
                </td>

                <!-- Localização -->
                <td class="py-3 px-4">
                  <p class="text-sm text-foreground">{{ fornecedor.cidade }}/{{ fornecedor.estado }}</p>
                  <p v-if="fornecedor.endereco" class="text-xs text-muted-foreground">{{ fornecedor.endereco }}</p>
                </td>

                <!-- Contato -->
                <td class="py-3 px-4">
                  <div class="flex flex-col gap-1">
                    <p class="text-xs text-foreground">📞 {{ fornecedor.telefone }}</p>
                    <p v-if="fornecedor.whatsapp" class="text-xs text-green-600">
                      <a :href="`https://wa.me/55${fornecedor.whatsapp.replace(/\D/g, '')}`" target="_blank" class="hover:underline">
                        WhatsApp
                      </a>
                    </p>
                    <p v-if="fornecedor.email" class="text-xs text-foreground truncate">{{ fornecedor.email }}</p>
                  </div>
                </td>

                <!-- Ações -->
                <td class="py-3 px-4">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="handleEditar(fornecedor)"
                      class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Editar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>

                    <button
                      @click="handleExcluir(fornecedor)"
                      class="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      title="Excluir"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="block lg:hidden p-4 space-y-3">
          <div
            v-for="fornecedor in fornecedoresFiltrados"
            :key="fornecedor.id"
            class="bg-background border border-border rounded-lg p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-start flex-1">
                <div v-if="fornecedor.logo_url" class="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <img :src="fornecedor.logo_url" :alt="fornecedor.empresa" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-foreground">{{ fornecedor.empresa }}</p>
                  <p class="text-xs text-muted-foreground">{{ fornecedor.nome }}</p>
                  <span v-if="fornecedor.destaque" class="inline-block mt-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
                    ⭐ Destaque
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <p><span class="text-muted-foreground">Categoria:</span> <span class="font-medium">{{ fornecedor.categoria }}</span></p>
              <p><span class="text-muted-foreground">Local:</span> {{ fornecedor.cidade }}/{{ fornecedor.estado }}</p>
              <p><span class="text-muted-foreground">Tel:</span> {{ fornecedor.telefone }}</p>
            </div>

            <div class="flex justify-end space-x-2 mt-3 pt-3 border-t border-border">
              <button
                @click="handleEditar(fornecedor)"
                class="px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Editar
              </button>
              <button
                @click="handleExcluir(fornecedor)"
                class="px-3 py-1.5 text-sm border border-red-500 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modais -->
      <AdminFornecedorParceiroModal
        :show="showModal"
        :fornecedor="fornecedorEditando"
        @close="showModal = false; fornecedorEditando = null"
        @confirm="confirmModal"
      />

      <AdminConfirmarExclusaoModal
        :show="showExcluirModal"
        :item-nome="fornecedorParaExcluir?.empresa || ''"
        @close="showExcluirModal = false; fornecedorParaExcluir = null"
        @confirm="confirmarExclusao"
      />
    </div>
  </div>
</template>
