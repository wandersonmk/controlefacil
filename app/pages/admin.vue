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
  reativarCliente,
  renovarAssinatura,
  renovarTokens,
  removerTokens,
  excluirCliente,
  editarCliente,
  diasParaVencimento
} = useAdminClientes()

const { fornecedoresParceiros, fetchFornecedoresParceirosAdmin } = useFornecedoresParceiros()

const toast = await useToastSafe()

// Modais
const showRenovarModal = ref(false)
const showTokensModal = ref(false)
const showExcluirModal = ref(false)
const showEditarModal = ref(false)
const showDesativarModal = ref(false)
const showReativarModal = ref(false)
const selectedCliente = ref<{ id: string, nome: string, availableTokens?: number } | null>(null)
const clienteParaEditar = ref<any>(null)

// Filtros
const searchQuery = ref('')
const filterStatus = ref('all')

// Contagem de fornecedores parceiros
const fornecedoresParceiroCount = computed(() => fornecedoresParceiros.value.length)

// Carrega dados ao montar
onMounted(() => {
  loadClientes()
  fetchFornecedoresParceirosAdmin()
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
    if (filterStatus.value === 'expired') {
      // Para "expired", mostrar apenas clientes vencidos (dias < 0)
      filtered = filtered.filter(c => {
        if (c.subscription_status === 'expired') return true
        const dias = diasParaVencimento(c)
        return dias < 0
      })
    } else if (filterStatus.value === 'vencendo-hoje') {
      // Para "vencendo-hoje", mostrar clientes com dias = 0
      filtered = filtered.filter(c => {
        const dias = diasParaVencimento(c)
        return dias === 0
      })
    } else {
      // Para outros status, comparar normalmente
      filtered = filtered.filter(c => c.subscription_status === filterStatus.value)
    }
  }

  // Ordena: primeiro por dias restantes (menores primeiro), depois alfabeticamente
  return filtered.sort((a, b) => {
    const diasA = diasParaVencimento(a)
    const diasB = diasParaVencimento(b)
    
    // Se os dias restantes são diferentes, ordena por dias (menores primeiro)
    if (diasA !== diasB) {
      return diasA - diasB
    }
    
    // Se os dias são iguais, ordena alfabeticamente por nome
    return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
  })
})

// Handlers dos modais
const handleDesativar = (clienteId: string) => {
  const cliente = clientes.value.find(c => c.id === clienteId)
  if (cliente) {
    selectedCliente.value = { id: cliente.id, nome: cliente.nome }
    showDesativarModal.value = true
  }
}

const confirmDesativar = async () => {
  if (selectedCliente.value) {
    await desativarCliente(selectedCliente.value.id)
    if (toast?.success) toast.success('Cliente desativado com sucesso')
    showDesativarModal.value = false
    selectedCliente.value = null
  }
}

const handleReativar = (clienteId: string) => {
  const cliente = clientes.value.find(c => c.id === clienteId)
  if (cliente) {
    selectedCliente.value = { id: cliente.id, nome: cliente.nome }
    showReativarModal.value = true
  }
}

const confirmReativar = async () => {
  if (selectedCliente.value) {
    await reativarCliente(selectedCliente.value.id)
    if (toast?.success) toast.success('Cliente reativado com sucesso')
    showReativarModal.value = false
    selectedCliente.value = null
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
    selectedCliente.value = { 
      id: cliente.id, 
      nome: cliente.nome,
      availableTokens: cliente.available_tokens 
    }
    showTokensModal.value = true
  }
}

const confirmRenovarTokens = async (data: { totalTokens: number, action: 'add' | 'remove' }) => {
  if (selectedCliente.value) {
    try {
      if (data.action === 'add') {
        await renovarTokens(selectedCliente.value.id, data.totalTokens)
        if (toast?.success) toast.success(`${data.totalTokens.toLocaleString('pt-BR')} tokens adicionados com sucesso`)
      } else {
        await removerTokens(selectedCliente.value.id, data.totalTokens)
        if (toast?.success) toast.success(`${data.totalTokens.toLocaleString('pt-BR')} tokens removidos com sucesso`)
      }
      showTokensModal.value = false
      selectedCliente.value = null
    } catch (err: any) {
      if (toast?.error) toast.error(err.message || 'Erro ao gerenciar tokens')
    }
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

const handleEditar = (clienteId: string) => {
  const cliente = clientes.value.find(c => c.id === clienteId)
  if (cliente) {
    clienteParaEditar.value = cliente
    showEditarModal.value = true
  }
}

const confirmEditar = async (dados: { nome: string, email: string, whatsapp: string | null }) => {
  if (clienteParaEditar.value) {
    try {
      await editarCliente(clienteParaEditar.value.id, dados)
      if (toast?.success) toast.success('Cliente editado com sucesso')
      showEditarModal.value = false
      clienteParaEditar.value = null
    } catch (error) {
      if (toast?.error) toast.error('Erro ao editar cliente')
    }
  }
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
      <!-- Header com ações rápidas -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Painel de Administração</h1>
          <p class="text-sm text-muted-foreground mt-1">Gerencie clientes e configurações do sistema</p>
        </div>
        <NuxtLink
          to="/admin-fornecedores"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <span>Fornecedores Parceiros</span>
        </NuxtLink>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
        <AdminStatsCard
          title="Total de Clientes"
          :value="stats.totalClientes"
          emoji="👥"
          color="blue"
          subtitle="Clientes cadastrados"
        />
        
        <AdminStatsCard
          title="Clientes Trial"
          :value="stats.clientesTrial"
          emoji="🕐"
          color="orange"
          subtitle="Período de teste"
        />
        
        <AdminStatsCard
          title="Clientes Pro"
          :value="stats.clientesPro"
          emoji="⭐"
          color="purple"
          subtitle="Planos pagos"
        />
        
        <AdminStatsCard
          title="Clientes Vencidos"
          :value="stats.clientesVencidos"
          emoji="⚠️"
          color="red"
          subtitle="Assinaturas expiradas"
        />
      </div>

      <!-- Segunda linha de cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
        <AdminStatsCard
          title="Clientes Básicos"
          :value="stats.clientesBasic"
          emoji="📦"
          color="blue"
          subtitle="Plano básico"
        />
        
        <AdminStatsCard
          title="Fornecedores Parceiros"
          :value="fornecedoresParceiroCount"
          emoji="🤝"
          color="purple"
          subtitle="Parcerias ativas"
        />
        
        <AdminStatsCard
          title="Clientes Enterprise"
          :value="stats.clientesEnterprise"
          emoji="🏢"
          color="orange"
          subtitle="Plano empresarial"
        />
        
        <AdminStatsCard
          title="Clientes essa Semana"
          :value="stats.clientesEssaSemana"
          emoji="🆕"
          color="blue"
          subtitle="Últimos 7 dias"
        />
        
        <AdminStatsCard
          title="Clientes Vencendo Hoje"
          :value="stats.clientesVencendoHoje"
          emoji="⏰"
          color="red"
          subtitle="Vencimento hoje"
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
              <option value="vencendo-hoje">Vence hoje</option>
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
        @reativar="handleReativar"
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
        :available-tokens="selectedCliente?.availableTokens || 0"
        @close="showTokensModal = false"
        @confirm="confirmRenovarTokens"
      />

      <AdminEditarClienteModal
        :show="showEditarModal"
        :cliente="clienteParaEditar"
        @close="showEditarModal = false; clienteParaEditar = null"
        @confirm="confirmEditar"
      />

      <AdminExcluirClienteModal
        :show="showExcluirModal"
        :cliente-nome="selectedCliente?.nome || ''"
        :cliente-id="selectedCliente?.id || ''"
        @close="showExcluirModal = false"
        @confirm="confirmExcluir"
      />

      <AdminDesativarClienteModal
        :show="showDesativarModal"
        :cliente-nome="selectedCliente?.nome || ''"
        :cliente-id="selectedCliente?.id || ''"
        @close="showDesativarModal = false"
        @confirm="confirmDesativar"
      />

      <AdminReativarClienteModal
        :show="showReativarModal"
        :cliente-nome="selectedCliente?.nome || ''"
        :cliente-id="selectedCliente?.id || ''"
        @close="showReativarModal = false"
        @confirm="confirmReativar"
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
