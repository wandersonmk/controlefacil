<template>
  <div class="bg-card text-card-foreground rounded-xl sm:rounded-lg border border-border shadow-sm">
    <!-- Header com título e botões de ação -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-border gap-4">
      <div class="flex-1">
        <h2 class="text-lg sm:text-xl font-semibold text-foreground">Gerenciamento de Estoque</h2>
        <p class="text-xs sm:text-sm text-muted-foreground mt-1">Controle seus produtos e níveis de estoque</p>
        <p v-if="produtos && produtos.length > 0" class="text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-2 gap-y-1">
          <span>Total: <span class="font-semibold text-primary">{{ produtos.length }}</span></span>
          <span class="hidden sm:inline">|</span>
          <span>Baixo: <span class="font-semibold text-orange-500">{{ produtosEstoqueBaixo }}</span></span>
          <span class="hidden sm:inline">|</span>
          <span>Esgotados: <span class="font-semibold text-red-500">{{ produtosEsgotados }}</span></span>
        </p>
      </div>
      
      <!-- Botões de ação -->
      <div class="flex items-center space-x-2">
        <button
          @click="abrirModalNovoProduto"
          class="flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Novo Produto</span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-4 sm:p-6 border-b border-border bg-muted/30">
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <!-- Busca -->
        <div class="flex-1">
          <input
            v-model="filtroNome"
            type="text"
            placeholder="Buscar produto..."
            class="w-full px-3 sm:px-4 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <!-- Filtro por status -->
        <div class="sm:w-48">
          <select
            v-model="filtroStatus"
            class="w-full px-3 sm:px-4 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos os status</option>
            <option value="normal">Normal</option>
            <option value="baixo">Estoque baixo</option>
            <option value="esgotado">Esgotado</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de produtos -->
    <div class="p-4 sm:p-6">
      <!-- Mensagem quando não há produtos -->
      <div v-if="produtosFiltrados.length === 0 && produtos.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum produto cadastrado</h3>
          <p class="text-muted-foreground mb-4">Comece adicionando seu primeiro produto ao estoque.</p>
          <button
            @click="abrirModalNovoProduto"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Adicionar Produto
          </button>
        </div>
      </div>

      <!-- Mensagem quando filtro não retorna resultados -->
      <div v-else-if="produtosFiltrados.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
          <p class="text-muted-foreground">Tente ajustar os filtros de busca.</p>
        </div>
      </div>

      <!-- Grid de produtos -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="produto in produtosFiltrados"
          :key="produto.id"
          class="bg-background border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
        >
          <!-- Cabeçalho do card -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0 pr-2">
              <h3 class="text-sm sm:text-base font-semibold text-foreground mb-1 line-clamp-2">{{ produto.nome }}</h3>
              <p class="text-xs text-muted-foreground line-clamp-1">{{ produto.categoria || 'Sem categoria' }}</p>
            </div>
            <div class="flex items-center space-x-1 flex-shrink-0">
              <!-- Botão editar -->
              <button
                @click="abrirModalEditarProduto(produto)"
                class="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Editar"
              >
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <!-- Botão excluir -->
              <button
                @click="confirmarExclusao(produto)"
                class="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                title="Excluir"
              >
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Status do estoque com barra de progresso -->
          <div class="mb-3">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-muted-foreground">Estoque</span>
              <span :class="getEstoqueColorClass(produto).text" class="font-semibold">
                {{ produto.quantidade }} / {{ produto.quantidade_minima * 10 }}
              </span>
            </div>
            <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                :class="getEstoqueColorClass(produto).bg"
                class="h-full transition-all duration-300"
                :style="{ width: getEstoquePercentual(produto) + '%' }"
              ></div>
            </div>
            <p class="text-xs mt-1" :class="getEstoqueColorClass(produto).text">
              {{ getEstoqueStatus(produto) }}
            </p>
          </div>

          <!-- Preço e unidade -->
          <div class="flex items-center justify-between mb-3 pt-3 border-t border-border">
            <div>
              <p class="text-xs text-muted-foreground">Preço</p>
              <p class="text-base font-bold text-foreground">R$ {{ formatarPreco(produto.preco_venda) }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted-foreground">Unidade</p>
              <p class="text-sm font-medium text-foreground">{{ produto.unidade_medida }}</p>
            </div>
          </div>

          <!-- Botões de ajuste rápido -->
          <div class="flex items-center gap-2">
            <button
              @click="() => ajustarQuantidade(produto.id, Math.max(0, produto.quantidade - 1))"
              :disabled="produto.quantidade <= 0"
              class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
            >
              - 1
            </button>
            <button
              @click="abrirModalAjustarEstoque(produto)"
              class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-xs sm:text-sm font-medium"
            >
              Ajustar
            </button>
            <button
              @click="() => ajustarQuantidade(produto.id, produto.quantidade + 1)"
              class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors text-xs sm:text-sm font-medium"
            >
              + 1
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Novo/Editar Produto -->
    <div
      v-if="modalProduto"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4"
      @click.self="fecharModalProduto"
    >
      <div class="bg-card rounded-none sm:rounded-lg shadow-xl max-w-md w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <!-- Header do modal -->
        <div class="flex items-center justify-between p-6 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">
            {{ produtoEditando ? 'Editar Produto' : 'Novo Produto' }}
          </h3>
          <button
            @click="fecharModalProduto"
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="salvarProduto" class="p-6 space-y-4">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nome do Produto *</label>
            <input
              v-model="formProduto.nome"
              type="text"
              required
              placeholder="Ex: Cadeira de escritório"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <!-- Categoria -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Categoria *</label>
            <input
              v-model="formProduto.categoria"
              type="text"
              required
              placeholder="Ex: Móveis"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <!-- Preço e Unidade -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Preço (R$) *</label>
              <input
                v-model="precoFormatado"
                type="text"
                required
                placeholder="R$ 0,00"
                @input="formatarPrecoInput"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Unidade *</label>
              <select
                v-model="formProduto.unidade_medida"
                required
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="UN">UN</option>
                <option value="KG">KG</option>
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="CX">CX</option>
                <option value="PC">PC</option>
              </select>
            </div>
          </div>

          <!-- Quantidade e Estoque Mínimo -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Quantidade *</label>
              <input
                v-model.number="formProduto.quantidade"
                type="number"
                min="0"
                required
                placeholder="0"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Quantidade Mínima *</label>
              <input
                v-model.number="formProduto.quantidade_minima"
                type="number"
                min="0"
                required
                placeholder="0"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <!-- Descrição -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Descrição (Opcional)</label>
            <textarea
              v-model="formProduto.descricao"
              rows="3"
              placeholder="Adicione detalhes sobre o produto..."
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            ></textarea>
          </div>

          <!-- Botões -->
          <div class="flex items-center space-x-3 pt-4">
            <button
              type="button"
              @click="fecharModalProduto"
              class="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
            >
              {{ produtoEditando ? 'Salvar' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Ajustar Estoque -->
    <div
      v-if="modalAjustarEstoque"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4"
      @click.self="fecharModalAjustarEstoque"
    >
      <div class="bg-card rounded-none sm:rounded-lg shadow-xl max-w-sm w-full h-full sm:h-auto overflow-y-auto">
        <!-- Header do modal -->
        <div class="flex items-center justify-between p-6 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">Ajustar Estoque</h3>
          <button
            @click="fecharModalAjustarEstoque"
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Conteúdo -->
        <div class="p-6">
          <p class="text-sm text-muted-foreground mb-4">
            Produto: <span class="font-semibold text-foreground">{{ produtoSelecionado?.nome }}</span>
          </p>
          <p class="text-sm text-muted-foreground mb-4">
            Estoque atual: <span class="font-semibold text-foreground">{{ produtoSelecionado?.quantidade }}</span>
          </p>

          <div class="space-y-4">
            <!-- Tipo de ajuste -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Tipo de Ajuste</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="tipoAjuste = 'adicionar'"
                  :class="tipoAjuste === 'adicionar' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'"
                  class="px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  @click="tipoAjuste = 'remover'"
                  :class="tipoAjuste === 'remover' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'"
                  class="px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Remover
                </button>
              </div>
            </div>

            <!-- Quantidade -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Quantidade</label>
              <input
                v-model.number="quantidadeAjuste"
                type="number"
                min="1"
                placeholder="0"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <!-- Novo total -->
            <div class="p-3 bg-muted rounded-lg">
              <p class="text-sm text-muted-foreground">Novo estoque:</p>
              <p class="text-2xl font-bold text-foreground">
                {{ calcularNovoEstoque() }}
              </p>
            </div>
          </div>

          <!-- Botões -->
          <div class="flex items-center space-x-3 mt-6">
            <button
              type="button"
              @click="fecharModalAjustarEstoque"
              class="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmarAjusteEstoque"
              class="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div
      v-if="modalConfirmarExclusao"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4"
      @click.self="fecharModalConfirmarExclusao"
    >
      <div class="bg-card rounded-none sm:rounded-lg shadow-xl max-w-sm w-full h-full sm:h-auto flex flex-col">
        <!-- Header do modal -->
        <div class="p-6 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">Confirmar Exclusão</h3>
        </div>

        <!-- Conteúdo -->
        <div class="p-6">
          <p class="text-sm text-muted-foreground mb-2">
            Tem certeza que deseja excluir o produto?
          </p>
          <p class="text-sm font-semibold text-foreground">
            {{ produtoParaExcluir?.nome }}
          </p>
        </div>

        <!-- Botões -->
        <div class="flex items-center space-x-3 px-6 pb-6">
          <button
            type="button"
            @click="fecharModalConfirmarExclusao"
            class="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="excluirProduto"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Interface do Produto atualizada para o banco
interface Produto {
  id: string
  empresa_id: string
  usuario_id: string
  nome: string
  descricao: string | null
  categoria: string | null
  quantidade: number
  quantidade_minima: number
  preco_custo: number
  preco_venda: number
  unidade_medida: string
  codigo_barras: string | null
  localizacao: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

// Usar composable de produtos
const {
  produtos,
  isLoading,
  error,
  fetchProdutos,
  addProduto,
  updateProduto,
  deleteProduto,
  ajustarQuantidade,
  clearError
} = useProdutos()

// Carregar produtos ao montar componente
onMounted(() => {
  fetchProdutos()
})

// Filtros
const filtroNome = ref('')
const filtroStatus = ref('todos')

// Modais
const modalProduto = ref(false)
const modalAjustarEstoque = ref(false)
const modalConfirmarExclusao = ref(false)

// Estados dos formulários
const produtoEditando = ref<Produto | null>(null)
const produtoSelecionado = ref<Produto | null>(null)
const produtoParaExcluir = ref<Produto | null>(null)
const tipoAjuste = ref<'adicionar' | 'remover'>('adicionar')
const quantidadeAjuste = ref(1)
const precoFormatado = ref('R$ 0,00')

const formProduto = ref({
  nome: '',
  categoria: '',
  preco_venda: 0,
  preco_custo: 0,
  unidade_medida: 'UN',
  quantidade: 0,
  quantidade_minima: 5,
  descricao: '',
  codigo_barras: '',
  localizacao: ''
})

// Computed
const produtosFiltrados = computed(() => {
  let resultado = produtos.value

  // Filtrar por nome
  if (filtroNome.value) {
    resultado = resultado.filter(p =>
      p.nome.toLowerCase().includes(filtroNome.value.toLowerCase()) ||
      (p.categoria && p.categoria.toLowerCase().includes(filtroNome.value.toLowerCase()))
    )
  }

  // Filtrar por status
  if (filtroStatus.value !== 'todos') {
    resultado = resultado.filter(p => {
      if (filtroStatus.value === 'esgotado') return p.quantidade === 0
      if (filtroStatus.value === 'baixo') return p.quantidade > 0 && p.quantidade <= p.quantidade_minima
      if (filtroStatus.value === 'normal') return p.quantidade > p.quantidade_minima
      return true
    })
  }

  return resultado
})

const produtosEstoqueBaixo = computed(() => {
  return produtos.value.filter(p => p.quantidade > 0 && p.quantidade <= p.quantidade_minima).length
})

const produtosEsgotados = computed(() => {
  return produtos.value.filter(p => p.quantidade === 0).length
})

// Métodos
function getEstoquePercentual(produto: Produto): number {
  const estoqueMaximo = produto.quantidade_minima * 10 // Assumir máximo como 10x o mínimo
  if (estoqueMaximo === 0) return 0
  return Math.min((produto.quantidade / estoqueMaximo) * 100, 100)
}

function getEstoqueStatus(produto: Produto): string {
  if (produto.quantidade === 0) return 'Esgotado'
  if (produto.quantidade <= produto.quantidade_minima) return 'Estoque baixo'
  if (produto.quantidade >= produto.quantidade_minima * 5) return 'Estoque cheio'
  return 'Estoque normal'
}

function getEstoqueColorClass(produto: Produto) {
  if (produto.quantidade === 0) {
    return {
      bg: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400'
    }
  }
  if (produto.quantidade <= produto.quantidade_minima) {
    return {
      bg: 'bg-orange-500',
      text: 'text-orange-600 dark:text-orange-400'
    }
  }
  if (produto.quantidade >= produto.quantidade_minima * 5) {
    return {
      bg: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400'
    }
  }
  return {
    bg: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400'
  }
}

function formatarPreco(preco: number): string {
  return preco.toFixed(2).replace('.', ',')
}

function formatarPrecoInput(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  if (valor === '') {
    precoFormatado.value = 'R$ 0,00'
    formProduto.value.preco_venda = 0
    return
  }
  
  // Converter para número
  const numero = parseInt(valor) / 100
  formProduto.value.preco_venda = numero
  
  // Formatar como moeda
  precoFormatado.value = 'R$ ' + numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function abrirModalNovoProduto() {
  produtoEditando.value = null
  precoFormatado.value = 'R$ 0,00'
  formProduto.value = {
    nome: '',
    categoria: '',
    preco_venda: 0,
    preco_custo: 0,
    unidade_medida: 'UN',
    quantidade: 0,
    quantidade_minima: 5,
    descricao: '',
    codigo_barras: '',
    localizacao: ''
  }
  modalProduto.value = true
}

function abrirModalEditarProduto(produto: Produto) {
  produtoEditando.value = produto
  precoFormatado.value = 'R$ ' + produto.preco_venda.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  formProduto.value = {
    nome: produto.nome,
    categoria: produto.categoria || '',
    preco_venda: produto.preco_venda,
    preco_custo: produto.preco_custo,
    unidade_medida: produto.unidade_medida,
    quantidade: produto.quantidade,
    quantidade_minima: produto.quantidade_minima,
    descricao: produto.descricao || '',
    codigo_barras: produto.codigo_barras || '',
    localizacao: produto.localizacao || ''
  }
  modalProduto.value = true
}

function fecharModalProduto() {
  modalProduto.value = false
  produtoEditando.value = null
}

async function salvarProduto() {
  try {
    if (produtoEditando.value) {
      // Editar produto existente
      await updateProduto(produtoEditando.value.id, {
        nome: formProduto.value.nome,
        categoria: formProduto.value.categoria || null,
        preco_venda: formProduto.value.preco_venda,
        preco_custo: formProduto.value.preco_custo,
        unidade_medida: formProduto.value.unidade_medida,
        quantidade: formProduto.value.quantidade,
        quantidade_minima: formProduto.value.quantidade_minima,
        descricao: formProduto.value.descricao || null,
        codigo_barras: formProduto.value.codigo_barras || null,
        localizacao: formProduto.value.localizacao || null
      })
    } else {
      // Criar novo produto
      await addProduto({
        nome: formProduto.value.nome,
        categoria: formProduto.value.categoria || null,
        preco_venda: formProduto.value.preco_venda,
        preco_custo: formProduto.value.preco_custo,
        unidade_medida: formProduto.value.unidade_medida,
        quantidade: formProduto.value.quantidade,
        quantidade_minima: formProduto.value.quantidade_minima,
        descricao: formProduto.value.descricao || null,
        codigo_barras: formProduto.value.codigo_barras || null,
        localizacao: formProduto.value.localizacao || null,
        ativo: true
      })
    }
    fecharModalProduto()
  } catch (err) {
    console.error('Erro ao salvar produto:', err)
  }
}

function confirmarExclusao(produto: Produto) {
  produtoParaExcluir.value = produto
  modalConfirmarExclusao.value = true
}

function fecharModalConfirmarExclusao() {
  modalConfirmarExclusao.value = false
  produtoParaExcluir.value = null
}

async function excluirProduto() {
  if (produtoParaExcluir.value) {
    try {
      await deleteProduto(produtoParaExcluir.value.id)
      fecharModalConfirmarExclusao()
    } catch (err) {
      console.error('Erro ao excluir produto:', err)
    }
  }
}

function abrirModalAjustarEstoque(produto: Produto) {
  produtoSelecionado.value = produto
  tipoAjuste.value = 'adicionar'
  quantidadeAjuste.value = 1
  modalAjustarEstoque.value = true
}

function fecharModalAjustarEstoque() {
  modalAjustarEstoque.value = false
  produtoSelecionado.value = null
}

function calcularNovoEstoque(): number {
  if (!produtoSelecionado.value) return 0
  const atual = produtoSelecionado.value.quantidade
  const ajuste = quantidadeAjuste.value || 0
  
  if (tipoAjuste.value === 'adicionar') {
    return atual + ajuste
  } else {
    return Math.max(0, atual - ajuste)
  }
}

async function confirmarAjusteEstoque() {
  if (produtoSelecionado.value) {
    try {
      const novoEstoque = calcularNovoEstoque()
      await ajustarQuantidade(produtoSelecionado.value.id, novoEstoque)
      fecharModalAjustarEstoque()
    } catch (err) {
      console.error('Erro ao ajustar estoque:', err)
    }
  }
}
</script>
