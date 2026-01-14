<template>
  <div class="space-y-6">
    <!-- Modal Criar/Editar Cliente -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4" @click.self="fecharModal">
      <div class="bg-card rounded-none sm:rounded-2xl shadow-xl w-full h-full sm:h-auto max-w-2xl border-0 overflow-y-auto">
        <div class="p-4 sm:p-6">
          <div class="flex items-center mb-6">
            <div class="p-2 bg-primary/10 rounded-lg mr-3">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-foreground">{{ editandoCliente ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
              <p class="text-xs text-muted-foreground">Preencha os dados do cliente</p>
            </div>
          </div>

          <!-- Formulário -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-foreground mb-2">
                Nome Completo <span class="text-red-500">*</span>
              </label>
              <input
                v-model="novoCliente.nome"
                type="text"
                placeholder="Ex: João da Silva"
                class="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-foreground mb-2">
                Telefone <span class="text-red-500">*</span>
              </label>
              <input
                v-model="novoCliente.telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                @input="formatarTelefone"
                class="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-foreground mb-2">
                Data de Aniversário
              </label>
              <input
                v-model="novoCliente.data_aniversario"
                type="date"
                class="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
              />
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="fecharModal"
              class="px-6 py-3 bg-muted hover:bg-muted/70 text-foreground rounded-xl transition-colors text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              @click="salvarCliente"
              :disabled="!clienteValido"
              class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl transition-all duration-200 text-xs font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>{{ editandoCliente ? 'Atualizar' : 'Adicionar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Card de Lista -->
    <div class="bg-card text-card-foreground rounded-xl sm:rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 gap-4">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-foreground">Lista de Clientes</h3>
          <p class="text-xs text-muted-foreground mt-1">
            {{ clientesFiltrados.length }} de {{ clientes.length }} cliente{{ clientes.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            @click="abrirModal"
            class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-colors text-xs font-semibold shadow-md flex-1 sm:flex-initial justify-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Novo</span>
          </button>
          
          <button
            @click="exportToPDF"
            :disabled="clientes.length === 0"
            class="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed justify-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span class="hidden sm:inline">PDF</span>
          </button>

          <button
            @click="exportToExcel"
            :disabled="clientes.length === 0"
            class="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed justify-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="p-4 sm:p-6 border-b border-border/50 bg-muted/20">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs font-medium text-foreground mb-2">Buscar por Nome</label>
            <input
              v-model="filtros.nome"
              type="text"
              placeholder="Digite o nome..."
              class="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-foreground mb-2">Buscar por Telefone</label>
            <input
              v-model="filtros.telefone"
              type="text"
              placeholder="Digite o telefone..."
              class="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-foreground mb-2">Aniversariantes do Mês</label>
            <select
              v-model="filtros.mesAniversario"
              class="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
            >
              <option value="">Todos os meses</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-muted-foreground animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground mb-2">Carregando clientes...</h3>
          <p class="text-xs text-muted-foreground">Aguarde um momento</p>
        </div>
      </div>

      <!-- Erro -->
      <div v-else-if="error" class="text-center py-12">
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-foreground mb-2">Erro ao carregar</h3>
          <p class="text-xs text-muted-foreground mb-4">{{ error }}</p>
          <button
            @click="fetchClientes"
            class="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
          >
            Tentar novamente
          </button>
        </div>
      </div>

      <!-- Vazio -->
      <div v-else-if="clientesFiltrados.length === 0" class="text-center py-12">
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-foreground mb-2">{{ clientes.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado' }}</h3>
          <p class="text-xs text-muted-foreground">{{ clientes.length === 0 ? 'Clique em "Novo" para adicionar' : 'Tente ajustar os filtros' }}</p>
        </div>
      </div>

      <!-- Lista Mobile (Cards) -->
      <div v-else class="block lg:hidden">
        <div class="divide-y divide-border/30" style="max-height: 500px; overflow-y: auto;">
          <div
            v-for="cliente in clientesFiltrados"
            :key="cliente.id"
            class="p-4 hover:bg-muted/20 transition-colors"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center flex-1">
                <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-primary font-semibold text-sm">{{ cliente.nome.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-semibold text-foreground truncate">{{ cliente.nome }}</h4>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ cliente.telefone }}</p>
                  <p v-if="cliente.data_aniversario" class="text-xs text-muted-foreground mt-0.5">
                    🎂 {{ formatarDataAniversario(cliente.data_aniversario) }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button
                @click="abrirWhatsApp(cliente.telefone)"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg transition-colors text-xs font-medium"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
              
              <button
                @click="editarCliente(cliente)"
                class="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-lg transition-colors"
                title="Editar"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              
              <button
                @click="excluirCliente(cliente.id)"
                class="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors"
                title="Excluir"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela Desktop -->
      <div v-if="!isLoading && !error && clientesFiltrados.length > 0" class="hidden lg:block overflow-x-auto">
        <div style="max-height: 500px; overflow-y: auto;">
          <table class="w-full">
            <thead class="bg-muted/30 sticky top-0">
              <tr class="border-b border-border">
                <th class="text-left py-3 px-4 font-bold text-foreground text-xs">Nome</th>
                <th class="text-left py-3 px-4 font-bold text-foreground text-xs">Telefone</th>
                <th class="text-left py-3 px-4 font-bold text-foreground text-xs">Aniversário</th>
                <th class="text-center py-3 px-4 font-bold text-foreground text-xs w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="cliente in clientesFiltrados" 
                :key="cliente.id"
                class="border-b border-border/30 hover:bg-muted/20 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span class="text-primary font-semibold text-xs">{{ cliente.nome.charAt(0).toUpperCase() }}</span>
                    </div>
                    <span class="text-xs text-foreground">{{ cliente.nome }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-xs text-foreground">{{ cliente.telefone }}</td>
                <td class="py-3 px-4 text-xs text-foreground">{{ formatarDataAniversario(cliente.data_aniversario) }}</td>
                <td class="py-3 px-4">
                  <div class="flex justify-center gap-2">
                    <button
                      @click="abrirWhatsApp(cliente.telefone)"
                      class="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors"
                      title="Abrir WhatsApp"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                    <button
                      @click="editarCliente(cliente)"
                      class="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                      title="Editar cliente"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="excluirCliente(cliente.id)"
                      class="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                      title="Excluir cliente"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientes, type Cliente, type ClienteInput } from '~/composables/useClientes'

const { clientes, isLoading, error, fetchClientes, addCliente, updateCliente, deleteCliente } = useClientes()

// Modal
const mostrarModal = ref(false)
const editandoCliente = ref<Cliente | null>(null)

// Formulário
const novoCliente = ref<ClienteInput>({
  nome: '',
  telefone: '',
  data_aniversario: ''
})

// Filtros
const filtros = ref({
  nome: '',
  telefone: '',
  mesAniversario: ''
})

// Clientes filtrados
const clientesFiltrados = computed(() => {
  return clientes.value.filter(cliente => {
    const nomeMatch = cliente.nome.toLowerCase().includes(filtros.value.nome.toLowerCase())
    const telefoneMatch = cliente.telefone.includes(filtros.value.telefone.replace(/\D/g, ''))
    
    let mesMatch = true
    if (filtros.value.mesAniversario && cliente.data_aniversario) {
      const mes = cliente.data_aniversario.split('-')[1]
      mesMatch = mes === filtros.value.mesAniversario
    }
    
    return nomeMatch && telefoneMatch && mesMatch
  })
})

// Validação
const clienteValido = computed(() => {
  return novoCliente.value.nome.trim() !== '' && novoCliente.value.telefone.trim() !== ''
})

// Carregar clientes
onMounted(() => {
  fetchClientes()
})

// Abrir modal
function abrirModal() {
  editandoCliente.value = null
  limparFormulario()
  mostrarModal.value = true
}

// Fechar modal
function fecharModal() {
  mostrarModal.value = false
  editandoCliente.value = null
  limparFormulario()
}

// Formatar telefone
function formatarTelefone(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  if (valor.length <= 11) {
    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
    }
  }
  
  novoCliente.value.telefone = valor
}

// Formatar data de aniversário
function formatarDataAniversario(data?: string): string {
  if (!data) return '—'
  
  try {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}`
  } catch {
    return '—'
  }
}

// Salvar cliente (adicionar ou atualizar)
async function salvarCliente() {
  if (!clienteValido.value) return

  const toast = await useToastSafe()
  let sucesso = false

  if (editandoCliente.value) {
    sucesso = await updateCliente(editandoCliente.value.id, novoCliente.value)
  } else {
    sucesso = await addCliente(novoCliente.value)
  }

  if (sucesso) {
    if (toast) {
      toast.success(`Cliente ${editandoCliente.value ? 'atualizado' : 'adicionado'} com sucesso!`, {
        position: 'top-right',
        timeout: 2000
      })
    }
    fecharModal()
    await fetchClientes()
  } else {
    if (toast) {
      toast.error(`Erro ao ${editandoCliente.value ? 'atualizar' : 'adicionar'} cliente.`, {
        position: 'top-right',
        timeout: 3000
      })
    }
  }
}

// Editar cliente
function editarCliente(cliente: Cliente) {
  editandoCliente.value = cliente
  novoCliente.value = {
    nome: cliente.nome,
    telefone: cliente.telefone,
    data_aniversario: cliente.data_aniversario || ''
  }
  mostrarModal.value = true
}

// Excluir cliente
async function excluirCliente(id: string) {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return

  const toast = await useToastSafe()
  const sucesso = await deleteCliente(id)

  if (sucesso) {
    if (toast) {
      toast.success('Cliente excluído com sucesso!', {
        position: 'top-right',
        timeout: 2000
      })
    }
    await fetchClientes()
  } else {
    if (toast) {
      toast.error('Erro ao excluir cliente.', {
        position: 'top-right',
        timeout: 3000
      })
    }
  }
}

// Abrir WhatsApp
function abrirWhatsApp(telefone: string) {
  const numero = telefone.replace(/\D/g, '')
  window.open(`https://wa.me/55${numero}`, '_blank')
}

// Limpar formulário
function limparFormulario() {
  novoCliente.value = {
    nome: '',
    telefone: '',
    data_aniversario: ''
  }
}

// Exportar PDF
async function exportToPDF() {
  const toast = await useToastSafe()
  if (toast) {
    toast.info('Funcionalidade em desenvolvimento', {
      position: 'top-right',
      timeout: 2000
    })
  }
}

// Exportar Excel
async function exportToExcel() {
  const toast = await useToastSafe()
  if (toast) {
    toast.info('Funcionalidade em desenvolvimento', {
      position: 'top-right',
      timeout: 2000
    })
  }
}
</script>

