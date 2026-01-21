<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'super-admin'],
  layout: 'dashboard'
})

const { 
  clientes, 
  stats, 
  loading, 
  error,
  loadClientes,
  desativarCliente,
  renovarAssinatura,
  renovarTokens,
  excluirCliente
} = useAdminClientes()

const toast = await useToastSafe()

// Modais
const showRenovarModal = ref(false)
const showTokensModal = ref(false)
const showExcluirModal = ref(false)
const selectedCliente = ref<{ id: string, nome: string } | null>(null)

// Filtros
const searchQuery = ref('')
const filterStatus = ref('all')

// Carrega dados ao montar
onMounted(() => {
  loadClientes()
})

// Clientes filtrados
const filteredClientes = computed(() => {
  let filtered = clientes.value

  // Filtra por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.nome.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.whatsapp?.includes(query)
    )
  }

  // Filtra por status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(c => c.subscription_status === filterStatus.value)
  }

  return filtered
})

// Handlers dos modais
const handleDesativar = async (clienteId: string) => {
  if (confirm('Tem certeza que deseja desativar este cliente?')) {
    await desativarCliente(clienteId)
    if (toast?.success) toast.success('Cliente desativado com sucesso')
  }
}

const handleRenovar = (clienteId: string) => {
  const cliente = clientes.value.find(c => c.id === clienteId)
  if (cliente) {
    selectedCliente.value = { id: cliente.id, nome: cliente.nome }
    showRenovarModal.value = true
  }
}

const handleRenovarTokens = (clienteId: string) => {
  const cliente = clientes.value.find(c => c.id === clienteId)
  if (cliente) {
    selectedCliente.value = { id: cliente.id, nome: cliente.nome }
    showTokensModal.value = true
  }
}

const confirmRenovarAssinatura = async (plan: string, period: string) => {
  if (selectedCliente.value) {
    await renovarAssinatura(
      selectedCliente.value.id, 
      plan as any, 
      period as any
    )
    if (toast?.success) toast.success('Assinatura renovada com sucesso')
    showRenovarModal.value = false
    selectedCliente.value = null
  }
}

const confirmRenovarTokens = async (totalTokens: number) => {
  if (selectedCliente.value) {
    await renovarTokens(selectedCliente.value.id, totalTokens)
    if (toast?.success) toast.success('Tokens renovados com sucesso')
    showTokensModal.value = false
    selectedCliente.value = null
  }
}

const handleEditar = (clienteId: string) => {
  if (toast?.info) toast.info('Funcionalidade de editar em desenvolvimento')
  // TODO: Implementar modal de edição
}

const handleExcluir = async (clienteId: string) => {
  const cliente = clientes.value.find(c => c.id === clienteId)
  if (!cliente) return
  
  selectedCliente.value = { id: cliente.id, nome: cliente.nome }
  showExcluirModal.value = true
}

const confirmExcluir = async () => {
  if (selectedCliente.value) {
    try {
      await excluirCliente(selectedCliente.value.id)
      if (toast?.success) toast.success('Cliente excluído com sucesso')
      showExcluirModal.value = false
      selectedCliente.value = null
    } catch (error) {
      if (toast?.error) toast.error('Erro ao excluir cliente')
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total de Clientes"
          :value="stats.totalClientes"
          icon="users"
          color="blue"
        />
        
        <AdminStatsCard
          title="Clientes Trial"
          :value="stats.clientesTrial"
          icon="clock"
          color="orange"
        />
        
        <AdminStatsCard
          title="Clientes Pro"
          :value="stats.clientesPro"
          icon="star"
          color="purple"
        />
        
        <AdminStatsCard
          title="Clientes Vencidos"
          :value="stats.clientesVencidos"
          icon="exclamation-circle"
          color="red"
        />
      </div>

      <!-- Filtros -->
      <div class="bg-card border border-border rounded-xl p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Nome, email ou whatsapp..."
                class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Filtrar por Status
            </label>
            <select
              v-model="filterStatus"
              class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos</option>
              <option value="trial">Trial</option>
              <option value="active">Ativo</option>
              <option value="expired">Expirado</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-500">
        {{ error }}
      </div>

      <!-- Tabela de Clientes -->
      <AdminClientesTable
        :clientes="filteredClientes"
        :loading="loading"
        @desativar="handleDesativar"
        @renovar="handleRenovar"
        @renovar-tokens="handleRenovarTokens"
        @editar="handleEditar"
        @excluir="handleExcluir"
      />

      <!-- Modais -->
      <AdminRenovarAssinaturaModal
        :show="showRenovarModal"
        :cliente-nome="selectedCliente?.nome || ''"
        :cliente-id="selectedCliente?.id || ''"
        @close="showRenovarModal = false"
        @confirm="confirmRenovarAssinatura"
      />

      <AdminRenovarTokensModal
        :show="showTokensModal"
        :cliente-nome="selectedCliente?.nome || ''"
        :cliente-id="selectedCliente?.id || ''"
        @close="showTokensModal = false"
        @confirm="confirmRenovarTokens"
      />

      <AdminExcluirClienteModal
        :show="showExcluirModal"
        :cliente-nome="selectedCliente?.nome || ''"
        :cliente-id="selectedCliente?.id || ''"
        @close="showExcluirModal = false"
        @confirm="confirmExcluir"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  animation: gradient 3s ease infinite;
}
</style>
