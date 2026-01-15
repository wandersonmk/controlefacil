<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-border gap-4">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Saídas Financeiras</h2>
        <p class="text-sm text-muted-foreground mt-1">Registre e acompanhe todas as despesas</p>
        <p class="text-xs text-muted-foreground mt-1">
          Total de saídas: <span class="font-semibold text-primary">{{ saidasFiltradas.length }}</span>
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="abrirModalAdicionar"
          class="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Nova Saída</span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtro por Tipo -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Tipo de Saída</label>
          <select
            v-model="filtros.tipo"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os tipos</option>
            <option value="Aluguel">Aluguel</option>
            <option value="Compras">Compras</option>
            <option value="Fornecedores">Fornecedores</option>
            <option value="Contas">Contas</option>
            <option value="Salários">Salários</option>
            <option value="Impostos">Impostos</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <!-- Filtro por Data Inicial -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Inicial</label>
          <input
            v-model="filtros.dataInicial"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Data Final -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Final</label>
          <input
            v-model="filtros.dataFinal"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Descrição -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Buscar</label>
          <input
            v-model="filtros.descricao"
            type="text"
            placeholder="Buscar por descrição..."
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <!-- Botão de limpar filtros -->
      <div class="flex items-center justify-between mt-4">
        <button
          @click="limparFiltros"
          class="flex items-center space-x-2 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <span>Limpar Filtros</span>
        </button>
        <!-- Total filtrado -->
        <div class="text-sm text-muted-foreground">
          Total: <span class="font-bold text-foreground">R$ {{ totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </div>
    </div>

    <!-- Lista de Saídas -->
    <div class="p-6">
      <!-- Cards Mobile -->
      <div class="block lg:hidden space-y-4">
        <div
          v-for="saida in saidasOrdenadas"
          :key="saida.id"
          class="bg-muted/30 rounded-lg border border-border p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getTipoClass(saida.tipo)">
                  {{ saida.tipo }}
                </span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getStatusClass(saida.status)">
                  {{ saida.status }}
                </span>
              </div>
              <h3 class="font-semibold text-foreground text-base">{{ saida.descricao }}</h3>
              <p class="text-sm text-muted-foreground mt-1">{{ saida.data }}</p>
            </div>
            <div class="text-right ml-2">
              <p class="text-xl font-bold text-red-600">R$ {{ saida.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
            </div>
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Forma de Pagamento:</span>
              <span class="font-medium text-foreground">{{ saida.formaPagamento }}</span>
            </div>
            <div v-if="saida.observacao" class="pt-2 border-t border-border">
              <span class="text-muted-foreground text-xs">Obs:</span>
              <p class="text-foreground text-xs mt-1">{{ saida.observacao }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
            <button
              @click="editarSaida(saida)"
              class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Editar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="excluirSaida(saida.id)"
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Excluir"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Tabela Desktop -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Data</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Descrição</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Tipo</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Valor</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Forma Pgto</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Status</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="saida in saidasOrdenadas"
              :key="saida.id"
              class="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <td class="py-3 px-4">
                <span class="text-sm font-medium text-foreground">{{ saida.data }}</span>
              </td>
              <td class="py-3 px-4">
                <div>
                  <p class="text-sm font-medium text-foreground">{{ saida.descricao }}</p>
                  <p v-if="saida.observacao" class="text-xs text-muted-foreground mt-1">{{ saida.observacao }}</p>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getTipoClass(saida.tipo)">
                  {{ saida.tipo }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm font-bold text-red-600">R$ {{ saida.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm text-foreground">{{ saida.formaPagamento }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getStatusClass(saida.status)">
                  {{ saida.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editarSaida(saida)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Editar"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    @click="excluirSaida(saida.id)"
                    class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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

      <!-- Mensagem quando não há saídas -->
      <div v-if="saidasFiltradas.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-foreground mb-2">Nenhuma saída encontrada</h3>
        <p class="text-muted-foreground">
          {{ filtrosAplicados ? 'Tente ajustar os filtros' : 'Clique em "Nova Saída" para registrar uma despesa' }}
        </p>
      </div>
    </div>

    <!-- Modal de Adicionar/Editar -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="fecharModal"
    >
      <div class="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-card border-b border-border p-6 z-10">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-foreground">
              {{ modoEdicao ? 'Editar Saída' : 'Nova Saída' }}
            </h3>
            <button
              @click="fecharModal"
              class="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="salvarSaida" class="p-6 space-y-4">
          <!-- Descrição -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Descrição *</label>
            <input
              v-model="formulario.descricao"
              type="text"
              required
              placeholder="Ex: Aluguel do mês, Compra de mercadorias..."
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Tipo e Valor -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Tipo *</label>
              <select
                v-model="formulario.tipo"
                required
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione...</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Compras">Compras</option>
                <option value="Fornecedores">Fornecedores</option>
                <option value="Contas">Contas</option>
                <option value="Salários">Salários</option>
                <option value="Impostos">Impostos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Valor *</label>
              <input
                v-model.number="formulario.valor"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <!-- Data e Forma de Pagamento -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Data *</label>
              <input
                v-model="formulario.data"
                type="date"
                required
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Forma de Pagamento *</label>
              <select
                v-model="formulario.formaPagamento"
                required
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione...</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão">Cartão</option>
                <option value="PIX">PIX</option>
                <option value="Transferência">Transferência</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Status *</label>
            <select
              v-model="formulario.status"
              required
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>

          <!-- Observação -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Observação</label>
            <textarea
              v-model="formulario.observacao"
              rows="3"
              placeholder="Adicione detalhes adicionais..."
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            ></textarea>
          </div>

          <!-- Botões -->
          <div class="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              @click="fecharModal"
              class="px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {{ modoEdicao ? 'Salvar Alterações' : 'Adicionar Saída' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Interface para Saída
interface Saida {
  id: string
  descricao: string
  tipo: string
  valor: number
  data: string
  formaPagamento: string
  status: string
  observacao: string
  created_at: string
}

// Interface para Filtros
interface Filtros {
  tipo: string
  dataInicial: string
  dataFinal: string
  descricao: string
}

// Dados mockados de saídas
const saidas = ref<Saida[]>([
  {
    id: '1',
    descricao: 'Aluguel do estabelecimento',
    tipo: 'Aluguel',
    valor: 2500.00,
    data: '05/01/2026',
    formaPagamento: 'Transferência',
    status: 'Pago',
    observacao: 'Aluguel referente ao mês de janeiro/2026',
    created_at: '2026-01-05T10:00:00'
  },
  {
    id: '2',
    descricao: 'Compra de mercadorias',
    tipo: 'Compras',
    valor: 3850.00,
    data: '08/01/2026',
    formaPagamento: 'Boleto',
    status: 'Pago',
    observacao: 'Reposição de estoque - produtos diversos',
    created_at: '2026-01-08T14:30:00'
  },
  {
    id: '3',
    descricao: 'Conta de energia elétrica',
    tipo: 'Contas',
    valor: 420.50,
    data: '10/01/2026',
    formaPagamento: 'PIX',
    status: 'Pago',
    observacao: 'Referente ao mês de dezembro/2025',
    created_at: '2026-01-10T09:15:00'
  },
  {
    id: '4',
    descricao: 'Salário - João Silva',
    tipo: 'Salários',
    valor: 2800.00,
    data: '05/01/2026',
    formaPagamento: 'Transferência',
    status: 'Pago',
    observacao: 'Salário referente a janeiro/2026',
    created_at: '2026-01-05T08:00:00'
  },
  {
    id: '5',
    descricao: 'Fornecedor ABC - Produtos limpeza',
    tipo: 'Fornecedores',
    valor: 680.00,
    data: '12/01/2026',
    formaPagamento: 'Cartão',
    status: 'Pago',
    observacao: 'Material de limpeza para o estabelecimento',
    created_at: '2026-01-12T11:20:00'
  },
  {
    id: '6',
    descricao: 'Conta de água',
    tipo: 'Contas',
    valor: 180.00,
    data: '15/01/2026',
    formaPagamento: 'PIX',
    status: 'Pendente',
    observacao: 'Vencimento em 15/01/2026',
    created_at: '2026-01-15T00:00:00'
  },
  {
    id: '7',
    descricao: 'IPTU 1ª parcela',
    tipo: 'Impostos',
    valor: 890.00,
    data: '10/01/2026',
    formaPagamento: 'Boleto',
    status: 'Pago',
    observacao: 'Primeira parcela de 10',
    created_at: '2026-01-10T15:00:00'
  },
  {
    id: '8',
    descricao: 'Internet empresarial',
    tipo: 'Contas',
    valor: 250.00,
    data: '20/01/2026',
    formaPagamento: 'Dinheiro',
    status: 'Pendente',
    observacao: 'Mensalidade do plano de 500MB',
    created_at: '2026-01-20T00:00:00'
  },
  {
    id: '9',
    descricao: 'Salário - Maria Costa',
    tipo: 'Salários',
    valor: 2400.00,
    data: '05/01/2026',
    formaPagamento: 'Transferência',
    status: 'Pago',
    observacao: 'Salário referente a janeiro/2026',
    created_at: '2026-01-05T08:05:00'
  },
  {
    id: '10',
    descricao: 'Manutenção equipamentos',
    tipo: 'Outros',
    valor: 450.00,
    data: '13/01/2026',
    formaPagamento: 'Cartão',
    status: 'Pago',
    observacao: 'Conserto da geladeira comercial',
    created_at: '2026-01-13T16:30:00'
  }
])

// Estados
const filtros = ref<Filtros>({
  tipo: '',
  dataInicial: '',
  dataFinal: '',
  descricao: ''
})

const mostrarModal = ref(false)
const modoEdicao = ref(false)
const saidaEditando = ref<string | null>(null)

const formulario = ref({
  descricao: '',
  tipo: '',
  valor: 0,
  data: '',
  formaPagamento: '',
  status: 'Pendente',
  observacao: ''
})

// Computed
const filtrosAplicados = computed(() => {
  return filtros.value.tipo !== '' || 
         filtros.value.dataInicial !== '' || 
         filtros.value.dataFinal !== '' || 
         filtros.value.descricao !== ''
})

const saidasFiltradas = computed(() => {
  let resultado = saidas.value

  if (filtros.value.tipo) {
    resultado = resultado.filter(s => s.tipo === filtros.value.tipo)
  }

  if (filtros.value.dataInicial) {
    resultado = resultado.filter(s => {
      const dataSaida = new Date(s.data.split('/').reverse().join('-'))
      const dataFiltro = new Date(filtros.value.dataInicial)
      return dataSaida >= dataFiltro
    })
  }

  if (filtros.value.dataFinal) {
    resultado = resultado.filter(s => {
      const dataSaida = new Date(s.data.split('/').reverse().join('-'))
      const dataFiltro = new Date(filtros.value.dataFinal)
      return dataSaida <= dataFiltro
    })
  }

  if (filtros.value.descricao) {
    const termo = filtros.value.descricao.toLowerCase()
    resultado = resultado.filter(s => 
      s.descricao.toLowerCase().includes(termo) ||
      s.observacao.toLowerCase().includes(termo)
    )
  }

  return resultado
})

const saidasOrdenadas = computed(() => {
  return [...saidasFiltradas.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

const totalSaidas = computed(() => {
  return saidasFiltradas.value.reduce((total, saida) => total + saida.valor, 0)
})

// Funções
function getTipoClass(tipo: string) {
  const classes = {
    'Aluguel': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    'Compras': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'Fornecedores': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'Contas': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    'Salários': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
    'Impostos': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    'Outros': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
  return classes[tipo as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

function getStatusClass(status: string) {
  const classes = {
    'Pago': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'Pendente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    'Vencido': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

function limparFiltros() {
  filtros.value = {
    tipo: '',
    dataInicial: '',
    dataFinal: '',
    descricao: ''
  }
}

function abrirModalAdicionar() {
  modoEdicao.value = false
  saidaEditando.value = null
  const dataHoje = new Date().toISOString().split('T')[0] || ''
  formulario.value = {
    descricao: '',
    tipo: '',
    valor: 0,
    data: dataHoje,
    formaPagamento: '',
    status: 'Pendente',
    observacao: ''
  }
  mostrarModal.value = true
}

function editarSaida(saida: Saida) {
  modoEdicao.value = true
  saidaEditando.value = saida.id
  
  // Converter data de DD/MM/YYYY para YYYY-MM-DD
  const [dia, mes, ano] = saida.data.split('/')
  const dataFormatada = `${ano}-${mes}-${dia}`
  
  formulario.value = {
    descricao: saida.descricao,
    tipo: saida.tipo,
    valor: saida.valor,
    data: dataFormatada,
    formaPagamento: saida.formaPagamento,
    status: saida.status,
    observacao: saida.observacao
  }
  mostrarModal.value = true
}

function fecharModal() {
  mostrarModal.value = false
  modoEdicao.value = false
  saidaEditando.value = null
}

function salvarSaida() {
  // Converter data de YYYY-MM-DD para DD/MM/YYYY
  const [ano, mes, dia] = formulario.value.data.split('-')
  const dataFormatada = `${dia}/${mes}/${ano}`
  
  if (modoEdicao.value && saidaEditando.value) {
    // Editar saída existente
    const index = saidas.value.findIndex(s => s.id === saidaEditando.value)
    if (index !== -1) {
      const saidaAtual = saidas.value[index]
      if (saidaAtual) {
        saidas.value[index] = {
          id: saidaAtual.id,
          created_at: saidaAtual.created_at,
          descricao: formulario.value.descricao,
          tipo: formulario.value.tipo,
          valor: formulario.value.valor,
          data: dataFormatada,
          formaPagamento: formulario.value.formaPagamento,
          status: formulario.value.status,
          observacao: formulario.value.observacao
        }
      }
    }
  } else {
    // Adicionar nova saída
    const novaSaida: Saida = {
      id: String(Date.now()),
      descricao: formulario.value.descricao,
      tipo: formulario.value.tipo,
      valor: formulario.value.valor,
      data: dataFormatada,
      formaPagamento: formulario.value.formaPagamento,
      status: formulario.value.status,
      observacao: formulario.value.observacao,
      created_at: new Date().toISOString()
    }
    saidas.value.push(novaSaida)
  }
  
  fecharModal()
}

function excluirSaida(id: string) {
  if (confirm('Tem certeza que deseja excluir esta saída?')) {
    saidas.value = saidas.value.filter(s => s.id !== id)
  }
}
</script>
