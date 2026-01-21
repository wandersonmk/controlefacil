<template>
  <div class="bg-card text-card-foreground rounded-xl sm:rounded-lg border border-border shadow-sm">
    <!-- Header -->
    <div class="p-4 sm:p-6 border-b border-border">
      <div class="flex-1">
        <h2 class="text-lg sm:text-xl font-semibold text-foreground">Fornecedores Parceiros</h2>
        <p class="text-xs sm:text-sm text-muted-foreground mt-1">
          Fornecedores recomendados com parcerias especiais
        </p>
        <p v-if="fornecedoresParceiros && fornecedoresParceiros.length > 0" class="text-xs text-muted-foreground mt-1">
          Total de fornecedores: <span class="font-semibold text-primary">{{ fornecedoresFiltrados.length }}</span>
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-4 sm:p-6 border-b border-border bg-muted/30">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Busca -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Buscar Fornecedor
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nome, empresa, categoria..."
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Estado -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Filtrar por Estado
          </label>
          <select
            v-model="filterEstado"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os estados</option>
            <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
          </select>
        </div>

        <!-- Filtro por Cidade -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Filtrar por Cidade
          </label>
          <select
            v-model="filterCidade"
            :disabled="filterEstado === 'all'"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">Todas as cidades</option>
            <option v-for="cidade in cidadesFiltradas" :key="cidade" :value="cidade">{{ cidade }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="p-12 text-center">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-lg font-medium text-muted-foreground">Carregando fornecedores parceiros...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 text-center">
      <div class="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-500">
        {{ error }}
      </div>
    </div>

    <!-- Lista de fornecedores -->
    <div v-else>
      <!-- Empty State -->
      <div v-if="fornecedoresFiltrados.length === 0" class="text-center py-12 px-4">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-foreground mb-2">Nenhum fornecedor encontrado</h3>
        <p class="text-muted-foreground">Tente ajustar os filtros de busca.</p>
      </div>

      <!-- Cards Mobile e Desktop -->
      <div v-else class="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="fornecedor in fornecedoresFiltrados"
          :key="fornecedor.id"
          class="bg-background border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all"
        >
          <!-- Header do Card -->
          <div class="flex items-start mb-3">
            <div v-if="fornecedor.logo_url" class="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <img :src="fornecedor.logo_url" :alt="fornecedor.empresa" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">{{ fornecedor.empresa }}</h3>
              <p class="text-xs text-muted-foreground truncate">{{ fornecedor.nome }}</p>
              <span v-if="fornecedor.destaque" class="inline-block mt-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
                ⭐ Destaque
              </span>
            </div>
          </div>

          <!-- Categoria -->
          <div class="mb-3">
            <span class="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
              {{ fornecedor.categoria }}
            </span>
          </div>

          <!-- Descrição -->
          <p v-if="fornecedor.descricao" class="text-sm text-muted-foreground mb-3 line-clamp-2">
            {{ fornecedor.descricao }}
          </p>

          <!-- Informações -->
          <div class="space-y-2 text-xs mb-4">
            <div class="flex items-center text-muted-foreground">
              <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>{{ fornecedor.cidade }}/{{ fornecedor.estado }}</span>
            </div>

            <div class="flex items-center text-muted-foreground">
              <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>{{ fornecedor.telefone }}</span>
            </div>

            <div v-if="fornecedor.email" class="flex items-center text-muted-foreground">
              <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="truncate">{{ fornecedor.email }}</span>
            </div>
          </div>

          <!-- Botões de ação -->
          <div class="flex gap-2">
            <a
              v-if="fornecedor.whatsapp"
              :href="`https://wa.me/55${fornecedor.whatsapp.replace(/\D/g, '')}`"
              target="_blank"
              class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium text-center flex items-center justify-center space-x-1"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>

            <a
              v-if="fornecedor.site"
              :href="fornecedor.site"
              target="_blank"
              class="flex-1 px-3 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors text-xs font-medium text-center flex items-center justify-center space-x-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
              <span>Site</span>
            </a>

            <a
              v-if="!fornecedor.whatsapp && !fornecedor.site"
              :href="`tel:${fornecedor.telefone.replace(/\D/g, '')}`"
              class="flex-1 px-3 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors text-xs font-medium text-center"
            >
              Ligar
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  fornecedoresParceiros,
  isLoading,
  error,
  estados,
  fetchFornecedoresParceiros
} = useFornecedoresParceiros()

// Filtros
const searchQuery = ref('')
const filterEstado = ref('all')
const filterCidade = ref('all')

// Carregar fornecedores ao montar
onMounted(() => {
  fetchFornecedoresParceiros()
})

// Cidades filtradas por estado
const cidadesFiltradas = computed(() => {
  if (filterEstado.value === 'all') {
    return []
  }
  const cidadesDoEstado = new Set(
    fornecedoresParceiros.value
      .filter(f => f.estado === filterEstado.value)
      .map(f => f.cidade)
  )
  return Array.from(cidadesDoEstado).sort()
})

// Resetar filtro de cidade quando muda o estado
watch(filterEstado, () => {
  filterCidade.value = 'all'
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
