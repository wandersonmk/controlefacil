<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header com título e botões de ação -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Lista de Fornecedores</h2>
        <p class="text-sm text-muted-foreground mt-1">Gerencie todos os seus fornecedores</p>
        <p v-if="fornecedores && fornecedores.length > 0" class="text-xs text-muted-foreground mt-1">
          Total de fornecedores: <span class="font-semibold text-primary">{{ fornecedores.length }}</span>
        </p>
      </div>
      
      <!-- Botões de ação -->
      <div class="flex items-center space-x-2">
        <button
          @click="abrirModalNovoFornecedor"
          class="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Novo Fornecedor</span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Busca -->
        <div class="flex-1">
          <input
            v-model="filtroBusca"
            type="text"
            placeholder="Buscar por nome, empresa ou CNPJ..."
            class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <!-- Filtro por categoria -->
        <div class="sm:w-48">
          <select
            v-model="filtroCategoria"
            class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todas categorias</option>
            <option value="Materiais">Materiais</option>
            <option value="Serviços">Serviços</option>
            <option value="Tecnologia">Tecnologia</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Limpeza">Limpeza</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de fornecedores -->
    <div class="p-6">
      <!-- Mensagem quando não há fornecedores -->
      <div v-if="fornecedoresFiltrados.length === 0 && fornecedores.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum fornecedor cadastrado</h3>
          <p class="text-muted-foreground mb-4">Comece adicionando seu primeiro fornecedor.</p>
          <button
            @click="abrirModalNovoFornecedor"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Adicionar Fornecedor
          </button>
        </div>
      </div>

      <!-- Mensagem quando filtro não retorna resultados -->
      <div v-else-if="fornecedoresFiltrados.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum fornecedor encontrado</h3>
          <p class="text-muted-foreground">Tente ajustar os filtros de busca.</p>
        </div>
      </div>

      <!-- Tabela de fornecedores -->
      <div v-else class="overflow-x-auto">
        <div style="max-height: 600px; overflow-y: auto;">
          <table class="w-full">
            <thead class="sticky top-0 bg-card z-10">
              <tr class="border-b border-border">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Fornecedor</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Categoria</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Contato</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Email</th>
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
                  <div class="flex flex-col">
                    <div class="flex items-center mb-1">
                      <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-foreground text-sm">{{ fornecedor.nome }}</p>
                        <p class="text-xs text-muted-foreground">{{ fornecedor.empresa }}</p>
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground ml-11">CNPJ: {{ formatarCNPJ(fornecedor.cnpj) }}</p>
                  </div>
                </td>

                <!-- Categoria -->
                <td class="py-3 px-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {{ fornecedor.categoria }}
                  </span>
                </td>

                <!-- Contato -->
                <td class="py-3 px-4">
                  <div class="flex flex-col space-y-1">
                    <div class="flex items-center text-sm text-foreground">
                      <svg class="w-3.5 h-3.5 mr-1.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      {{ formatarTelefone(fornecedor.telefone) }}
                    </div>
                    <div v-if="fornecedor.celular" class="flex items-center text-sm text-foreground">
                      <svg class="w-3.5 h-3.5 mr-1.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      {{ formatarTelefone(fornecedor.celular) }}
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="py-3 px-4">
                  <p class="text-sm text-foreground">{{ fornecedor.email }}</p>
                </td>

                <!-- Ações -->
                <td class="py-3 px-4">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="abrirModalEditarFornecedor(fornecedor)"
                      class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Editar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="confirmarExclusao(fornecedor)"
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
      </div>
    </div>

    <!-- Modal de Novo/Editar Fornecedor -->
    <div
      v-if="modalFornecedor"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="fecharModalFornecedor"
    >
      <div class="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header do modal -->
        <div class="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 class="text-lg font-semibold text-foreground">
            {{ fornecedorEditando ? 'Editar Fornecedor' : 'Novo Fornecedor' }}
          </h3>
          <button
            @click="fecharModalFornecedor"
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="salvarFornecedor" class="p-6 space-y-4">
          <!-- Nome do contato e Empresa -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Nome do Contato *</label>
              <input
                v-model="formFornecedor.nome"
                type="text"
                required
                placeholder="Ex: João Silva"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Empresa *</label>
              <input
                v-model="formFornecedor.empresa"
                type="text"
                required
                placeholder="Ex: Empresa Ltda"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <!-- CNPJ e Categoria -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">CNPJ *</label>
              <input
                v-model="formFornecedor.cnpj"
                type="text"
                required
                placeholder="00.000.000/0000-00"
                maxlength="18"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Categoria *</label>
              <select
                v-model="formFornecedor.categoria"
                required
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                <option value="Materiais">Materiais</option>
                <option value="Serviços">Serviços</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Email *</label>
            <input
              v-model="formFornecedor.email"
              type="email"
              required
              placeholder="contato@empresa.com"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <!-- Telefone e Celular -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Telefone *</label>
              <input
                v-model="formFornecedor.telefone"
                type="tel"
                required
                placeholder="(00) 0000-0000"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Celular (Opcional)</label>
              <input
                v-model="formFornecedor.celular"
                type="tel"
                placeholder="(00) 00000-0000"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <!-- Endereço -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Endereço (Opcional)</label>
            <input
              v-model="formFornecedor.endereco"
              type="text"
              placeholder="Rua, número, bairro"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <!-- Cidade e Estado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Cidade (Opcional)</label>
              <input
                v-model="formFornecedor.cidade"
                type="text"
                placeholder="Ex: São Paulo"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Estado (Opcional)</label>
              <input
                v-model="formFornecedor.estado"
                type="text"
                placeholder="Ex: SP"
                maxlength="2"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <!-- Observações -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Observações (Opcional)</label>
            <textarea
              v-model="formFornecedor.observacoes"
              rows="3"
              placeholder="Informações adicionais sobre o fornecedor..."
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            ></textarea>
          </div>

          <!-- Botões -->
          <div class="flex items-center space-x-3 pt-4">
            <button
              type="button"
              @click="fecharModalFornecedor"
              class="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
            >
              {{ fornecedorEditando ? 'Salvar' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div
      v-if="modalConfirmarExclusao"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="fecharModalConfirmarExclusao"
    >
      <div class="bg-card rounded-lg shadow-xl max-w-sm w-full">
        <!-- Header do modal -->
        <div class="p-6 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">Confirmar Exclusão</h3>
        </div>

        <!-- Conteúdo -->
        <div class="p-6">
          <p class="text-sm text-muted-foreground mb-2">
            Tem certeza que deseja excluir o fornecedor?
          </p>
          <p class="text-sm font-semibold text-foreground mb-1">
            {{ fornecedorParaExcluir?.empresa }}
          </p>
          <p class="text-xs text-muted-foreground">
            CNPJ: {{ fornecedorParaExcluir ? formatarCNPJ(fornecedorParaExcluir.cnpj) : '' }}
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
            @click="excluirFornecedor"
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
import { ref, computed } from 'vue'

// Interface do Fornecedor
interface Fornecedor {
  id: number
  nome: string
  empresa: string
  cnpj: string
  categoria: string
  email: string
  telefone: string
  celular?: string
  endereco?: string
  cidade?: string
  estado?: string
  observacoes?: string
}

// Estado
const fornecedores = ref<Fornecedor[]>([
  // Dados de exemplo
  {
    id: 1,
    nome: 'Carlos Mendes',
    empresa: 'Tech Solutions Ltda',
    cnpj: '12345678000190',
    categoria: 'Tecnologia',
    email: 'contato@techsolutions.com',
    telefone: '1133334444',
    celular: '11999998888',
    endereco: 'Av. Paulista, 1000',
    cidade: 'São Paulo',
    estado: 'SP',
    observacoes: 'Fornecedor de equipamentos de TI'
  },
  {
    id: 2,
    nome: 'Ana Paula',
    empresa: 'Materiais Diversos S.A.',
    cnpj: '98765432000111',
    categoria: 'Materiais',
    email: 'vendas@materiaisdiversos.com.br',
    telefone: '1144445555',
    celular: '11988887777',
    endereco: 'Rua Comércio, 500',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  {
    id: 3,
    nome: 'Roberto Lima',
    empresa: 'Clean Pro Serviços',
    cnpj: '11223344000155',
    categoria: 'Limpeza',
    email: 'contato@cleanpro.com',
    telefone: '1155556666',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    observacoes: 'Fornecedor de produtos de limpeza profissional'
  }
])

// Filtros
const filtroBusca = ref('')
const filtroCategoria = ref('todos')

// Modais
const modalFornecedor = ref(false)
const modalConfirmarExclusao = ref(false)

// Estados dos formulários
const fornecedorEditando = ref<Fornecedor | null>(null)
const fornecedorParaExcluir = ref<Fornecedor | null>(null)

const formFornecedor = ref({
  nome: '',
  empresa: '',
  cnpj: '',
  categoria: '',
  email: '',
  telefone: '',
  celular: '',
  endereco: '',
  cidade: '',
  estado: '',
  observacoes: ''
})

// Computed
const fornecedoresFiltrados = computed(() => {
  let resultado = fornecedores.value

  // Filtrar por busca
  if (filtroBusca.value) {
    const busca = filtroBusca.value.toLowerCase()
    resultado = resultado.filter(f =>
      f.nome.toLowerCase().includes(busca) ||
      f.empresa.toLowerCase().includes(busca) ||
      f.cnpj.includes(busca) ||
      f.email.toLowerCase().includes(busca)
    )
  }

  // Filtrar por categoria
  if (filtroCategoria.value !== 'todos') {
    resultado = resultado.filter(f => f.categoria === filtroCategoria.value)
  }

  return resultado
})

// Métodos
function formatarCNPJ(cnpj: string): string {
  const numeros = cnpj.replace(/\D/g, '')
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '')
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

function abrirModalNovoFornecedor() {
  fornecedorEditando.value = null
  formFornecedor.value = {
    nome: '',
    empresa: '',
    cnpj: '',
    categoria: '',
    email: '',
    telefone: '',
    celular: '',
    endereco: '',
    cidade: '',
    estado: '',
    observacoes: ''
  }
  modalFornecedor.value = true
}

function abrirModalEditarFornecedor(fornecedor: Fornecedor) {
  fornecedorEditando.value = fornecedor
  formFornecedor.value = {
    nome: fornecedor.nome,
    empresa: fornecedor.empresa,
    cnpj: fornecedor.cnpj,
    categoria: fornecedor.categoria,
    email: fornecedor.email,
    telefone: fornecedor.telefone,
    celular: fornecedor.celular || '',
    endereco: fornecedor.endereco || '',
    cidade: fornecedor.cidade || '',
    estado: fornecedor.estado || '',
    observacoes: fornecedor.observacoes || ''
  }
  modalFornecedor.value = true
}

function fecharModalFornecedor() {
  modalFornecedor.value = false
  fornecedorEditando.value = null
}

function salvarFornecedor() {
  if (fornecedorEditando.value) {
    // Editar fornecedor existente
    const index = fornecedores.value.findIndex(f => f.id === fornecedorEditando.value!.id)
    if (index !== -1) {
      fornecedores.value[index] = {
        ...fornecedorEditando.value,
        ...formFornecedor.value
      }
    }
  } else {
    // Criar novo fornecedor
    const novoId = Math.max(...fornecedores.value.map(f => f.id), 0) + 1
    fornecedores.value.push({
      id: novoId,
      ...formFornecedor.value
    })
  }
  fecharModalFornecedor()
}

function confirmarExclusao(fornecedor: Fornecedor) {
  fornecedorParaExcluir.value = fornecedor
  modalConfirmarExclusao.value = true
}

function fecharModalConfirmarExclusao() {
  modalConfirmarExclusao.value = false
  fornecedorParaExcluir.value = null
}

function excluirFornecedor() {
  if (fornecedorParaExcluir.value) {
    fornecedores.value = fornecedores.value.filter(f => f.id !== fornecedorParaExcluir.value!.id)
  }
  fecharModalConfirmarExclusao()
}
</script>
