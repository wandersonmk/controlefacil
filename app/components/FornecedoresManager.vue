<template>
  <div class="bg-card text-card-foreground rounded-xl sm:rounded-lg border border-border shadow-sm">
    <!-- Header com título e botões de ação -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-border gap-4">
      <div class="flex-1">
        <h2 class="text-lg sm:text-xl font-semibold text-foreground">Lista de Fornecedores</h2>
        <p class="text-xs sm:text-sm text-muted-foreground mt-1">Gerencie todos os seus fornecedores</p>
        <p v-if="fornecedores && fornecedores.length > 0" class="text-xs text-muted-foreground mt-1">
          Total de fornecedores: <span class="font-semibold text-primary">{{ fornecedores.length }}</span>
        </p>
      </div>
      
      <!-- Botões de ação -->
      <div class="flex items-center space-x-2">
        <button
          @click="abrirModalGerenciarCategorias"
          class="flex items-center justify-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors text-xs sm:text-sm font-medium"
          title="Gerenciar Categorias"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span class="hidden sm:inline">Categorias</span>
        </button>
        <button
          @click="abrirModalNovoFornecedor"
          class="flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Novo Fornecedor</span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-4 sm:p-6 border-b border-border bg-muted/30">
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <!-- Busca -->
        <div class="flex-1">
          <input
            v-model="filtroBusca"
            type="text"
            placeholder="Buscar por nome, empresa ou CNPJ..."
            class="w-full px-3 sm:px-4 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <!-- Filtro por categoria -->
        <div class="sm:w-48">
          <select
            v-model="filtroCategoria"
            class="w-full px-3 sm:px-4 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todas categorias</option>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.nome">
              {{ cat.nome }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de fornecedores -->
    <div class="p-4 sm:p-6">
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

      <!-- Cards Mobile -->
      <div v-else class="block lg:hidden space-y-3">
        <div
          v-for="fornecedor in fornecedoresFiltrados"
          :key="fornecedor.id"
          class="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Cabeçalho -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-start flex-1 min-w-0">
              <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-foreground truncate">{{ fornecedor.nome }}</h3>
                <p class="text-xs text-muted-foreground truncate">{{ fornecedor.empresa }}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                  {{ fornecedor.categoria }}
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-1 ml-2 flex-shrink-0">
              <button
                v-if="fornecedor.whatsapp"
                @click="abrirWhatsApp(fornecedor.whatsapp)"
                class="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                title="Chamar no WhatsApp"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
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
          </div>

          <!-- Informações -->
          <div class="space-y-2 pt-3 border-t border-border">
            <div class="flex items-center text-xs text-muted-foreground">
              <span class="font-medium mr-2">CNPJ:</span>
              <span class="text-foreground">{{ formatarCNPJ(fornecedor.cnpj) }}</span>
            </div>
            <div class="flex items-start text-xs">
              <svg class="w-3.5 h-3.5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <p class="text-foreground">{{ formatarTelefone(fornecedor.telefone) }}</p>
            </div>
            <div class="flex items-start text-xs">
              <svg class="w-3.5 h-3.5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <p class="text-foreground break-all">{{ fornecedor.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela Desktop -->
      <div v-if="fornecedoresFiltrados.length > 0" class="hidden lg:block overflow-x-auto">
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
                  <div class="flex items-center text-sm text-foreground">
                    <svg class="w-3.5 h-3.5 mr-1.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {{ formatarTelefone(fornecedor.telefone) }}
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
                      v-if="fornecedor.whatsapp"
                      @click="abrirWhatsApp(fornecedor.whatsapp)"
                      class="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                      title="Chamar no WhatsApp"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </button>
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
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4"
      @click.self="fecharModalFornecedor"
    >
      <div class="bg-card rounded-none sm:rounded-lg shadow-xl max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
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
                @input="formatarCNPJInput"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Categoria *</label>
              <select
                v-model="formFornecedor.categoria"
                :required="!criandoNovaCategoria"
                @change="verificarNovaCategoria"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.nome">
                  {{ cat.nome }}
                </option>
                <option value="__nova__">+ Nova categoria...</option>
              </select>
              
              <!-- Input para nova categoria -->
              <input
                v-if="criandoNovaCategoria"
                v-model="novaCategoria"
                type="text"
                required
                placeholder="Digite a nova categoria"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mt-2"
                @keyup.enter="salvarNovaCategoria"
              />
              <div v-if="criandoNovaCategoria" class="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  @click="salvarNovaCategoria"
                  class="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  @click="cancelarNovaCategoria"
                  class="flex-1 px-3 py-1.5 bg-muted hover:bg-muted/70 text-foreground text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Email (Opcional)</label>
            <input
              v-model="formFornecedor.email"
              type="email"
              placeholder="contato@empresa.com"
              class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <!-- Telefone e WhatsApp -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Telefone *</label>
              <input
                v-model="formFornecedor.telefone"
                type="tel"
                required
                placeholder="(00) 0000-0000"
                maxlength="15"
                @input="formatarTelefoneInput"
                class="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                <div class="flex items-center">
                  WhatsApp (Opcional)
                  <svg class="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
              </label>
              <input
                v-model="formFornecedor.whatsapp"
                type="tel"
                placeholder="(00) 00000-0000"
                maxlength="15"
                @input="formatarWhatsAppInput"
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
                @input="formatarEstadoInput"
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

    <!-- Modal de Gerenciamento de Categorias -->
    <div
      v-if="modalGerenciarCategorias"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4"
      @click.self="fecharModalGerenciarCategorias"
    >
      <div class="bg-card rounded-none sm:rounded-lg shadow-xl max-w-lg w-full h-full sm:h-auto flex flex-col max-h-screen sm:max-h-[90vh]">
        <!-- Header do modal -->
        <div class="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-foreground">Gerenciar Categorias</h3>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1">Adicione ou remova categorias de fornecedores</p>
          </div>
          <button
            @click="fecharModalGerenciarCategorias"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Conteúdo - Lista de categorias -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <!-- Adicionar nova categoria -->
          <div class="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <label class="block text-sm font-medium text-foreground mb-2">Nova Categoria</label>
            <div class="flex gap-2">
              <input
                v-model="novaCategoriaModal"
                type="text"
                placeholder="Digite o nome da categoria"
                class="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                @keyup.enter="adicionarCategoriaModal"
              />
              <button
                @click="adicionarCategoriaModal"
                class="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
              >
                Adicionar
              </button>
            </div>
          </div>

          <!-- Lista de categorias existentes -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-foreground mb-3">Categorias Existentes ({{ categorias.length }})</h4>
            
            <div v-if="categorias.length === 0" class="text-center py-8 text-muted-foreground text-sm">
              Nenhuma categoria cadastrada
            </div>

            <div
              v-for="categoria in categorias"
              :key="categoria.id"
              class="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ categoria.nome }}</p>
                <p v-if="categoria.descricao" class="text-xs text-muted-foreground mt-1 truncate">{{ categoria.descricao }}</p>
              </div>
              
              <button
                @click="confirmarExcluirCategoria(categoria)"
                class="ml-3 p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Excluir categoria"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-6 border-t border-border">
          <button
            @click="fecharModalGerenciarCategorias"
            class="w-full px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de exclusão de categoria -->
    <div
      v-if="modalConfirmarExcluirCategoria"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      @click.self="fecharModalConfirmarExcluirCategoria"
    >
      <div class="bg-card rounded-lg shadow-xl max-w-sm w-full">
        <!-- Header -->
        <div class="p-6 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">Confirmar Exclusão</h3>
        </div>

        <!-- Conteúdo -->
        <div class="p-6">
          <p class="text-sm text-muted-foreground mb-2">
            Tem certeza que deseja excluir a categoria?
          </p>
          <p class="text-sm font-semibold text-foreground">
            {{ categoriaParaExcluir?.nome }}
          </p>
        </div>

        <!-- Botões -->
        <div class="flex items-center space-x-3 px-6 pb-6">
          <button
            @click="fecharModalConfirmarExcluirCategoria"
            class="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="excluirCategoriaConfirmado"
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
import type { FornecedorInput } from '~/composables/useFornecedores'

// Usar composable de fornecedores
const { 
  fornecedores, 
  isLoading: loadingFornecedores, 
  fetchFornecedores,
  addFornecedor,
  updateFornecedor,
  deleteFornecedor
} = useFornecedores()

// Usar composable de categorias
const { 
  categorias, 
  fetchCategorias, 
  addCategoria, 
  categoriaExiste,
  categoriaEmUso,
  deleteCategoria
} = useCategorias()

// Toast
const toast = ref<any>(null)

// Carregar fornecedores e categorias ao montar
onMounted(async () => {
  if (process.client) {
    toast.value = await useToastSafe()
  }
  await Promise.all([
    fetchFornecedores(),
    fetchCategorias('fornecedor')
  ])
  console.log('📦 Categorias carregadas:', categorias.value)
})

// Interface do Fornecedor (para compatibilidade com o componente)
interface Fornecedor {
  id: string
  nome: string
  empresa: string
  cnpj: string
  categoria: string
  email?: string
  telefone: string
  whatsapp?: string
  endereco?: string
  cidade?: string
  estado?: string
  observacoes?: string
}

// Filtros
const filtroBusca = ref('')
const filtroCategoria = ref('todos')

// Estado para nova categoria
const criandoNovaCategoria = ref(false)
const novaCategoria = ref('')
const novaCategoriaModal = ref('')

// Modais
const modalFornecedor = ref(false)
const modalConfirmarExclusao = ref(false)
const modalGerenciarCategorias = ref(false)
const modalConfirmarExcluirCategoria = ref(false)

// Estados dos formulários
const fornecedorEditando = ref<Fornecedor | null>(null)
const fornecedorParaExcluir = ref<Fornecedor | null>(null)
const categoriaParaExcluir = ref<any>(null)

const formFornecedor = ref({
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
      (f.email?.toLowerCase().includes(busca) || false)
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

function abrirWhatsApp(whatsapp: string) {
  const numero = whatsapp.replace(/\D/g, '')
  const url = `https://wa.me/55${numero}`
  window.open(url, '_blank')
}

function verificarNovaCategoria(event: Event) {
  const select = event.target as HTMLSelectElement
  if (select.value === '__nova__') {
    criandoNovaCategoria.value = true
    novaCategoria.value = ''
    formFornecedor.value.categoria = ''
  } else {
    criandoNovaCategoria.value = false
  }
}

async function salvarNovaCategoria() {
  if (!novaCategoria.value.trim()) {
    if (toast.value) {
      toast.value.warning('Digite o nome da categoria', {
        position: 'top-right',
        timeout: 2000
      })
    }
    return
  }

  const nomeCategoria = novaCategoria.value.trim()

  // Verificar se categoria já existe
  const existe = await categoriaExiste(nomeCategoria, 'fornecedor')
  if (existe) {
    if (toast.value) {
      toast.value.warning(`A categoria "${nomeCategoria}" já existe!`, {
        position: 'top-right',
        timeout: 2500
      })
    }
    // Usar categoria existente
    formFornecedor.value.categoria = nomeCategoria
    criandoNovaCategoria.value = false
    novaCategoria.value = ''
    return
  }

  // Salvar nova categoria no banco
  const categoriaData = await addCategoria({
    nome: nomeCategoria,
    tipo: 'fornecedor'
  })

  if (categoriaData) {
    formFornecedor.value.categoria = nomeCategoria
    criandoNovaCategoria.value = false
    
    if (toast.value) {
      toast.value.success(`Categoria "${nomeCategoria}" criada com sucesso!`, {
        position: 'top-right',
        timeout: 2500
      })
    }
    
    console.log('✅ Nova categoria salva no banco:', categoriaData)
    novaCategoria.value = ''
  } else if (toast.value) {
    toast.value.error('Erro ao criar categoria. Tente novamente.', {
      position: 'top-right',
      timeout: 3000
    })
  }
}

function cancelarNovaCategoria() {
  criandoNovaCategoria.value = false
  novaCategoria.value = ''
  formFornecedor.value.categoria = ''
}

function abrirModalNovoFornecedor() {
  fornecedorEditando.value = null
  criandoNovaCategoria.value = false
  novaCategoria.value = ''
  formFornecedor.value = {
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
    observacoes: ''
  }
  modalFornecedor.value = true
}

function abrirModalEditarFornecedor(fornecedor: Fornecedor) {
  fornecedorEditando.value = fornecedor
  criandoNovaCategoria.value = false
  novaCategoria.value = ''
  formFornecedor.value = {
    nome: fornecedor.nome,
    empresa: fornecedor.empresa,
    cnpj: fornecedor.cnpj,
    categoria: fornecedor.categoria,
    email: fornecedor.email || '',
    telefone: fornecedor.telefone,
    whatsapp: fornecedor.whatsapp || '',
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
  criandoNovaCategoria.value = false
  novaCategoria.value = ''
}

async function salvarFornecedor() {
  // Validar se está criando categoria mas não preencheu
  if (criandoNovaCategoria.value && !formFornecedor.value.categoria) {
    if (toast.value) {
      toast.value.error('Por favor, digite a nova categoria ou selecione uma existente.', {
        position: 'top-right',
        timeout: 3000
      })
    }
    return
  }

  console.log('📝 Dados do fornecedor a serem salvos:', {
    categoria: formFornecedor.value.categoria,
    nome: formFornecedor.value.nome,
    empresa: formFornecedor.value.empresa
  })

  const fornecedorData: FornecedorInput = {
    nome: formFornecedor.value.nome,
    empresa: formFornecedor.value.empresa,
    cnpj: formFornecedor.value.cnpj,
    categoria: formFornecedor.value.categoria,
    email: formFornecedor.value.email,
    telefone: formFornecedor.value.telefone,
    whatsapp: formFornecedor.value.whatsapp || undefined,
    endereco: formFornecedor.value.endereco || undefined,
    cidade: formFornecedor.value.cidade || undefined,
    estado: formFornecedor.value.estado || undefined,
    observacoes: formFornecedor.value.observacoes || undefined
  }

  console.log('📤 Enviando ao banco:', fornecedorData)

  let sucesso = false

  if (fornecedorEditando.value) {
    // Editar fornecedor existente
    sucesso = await updateFornecedor(fornecedorEditando.value.id, fornecedorData)
    if (sucesso && toast.value) {
      toast.value.success('Fornecedor atualizado com sucesso!', { 
        position: 'top-right', 
        timeout: 3000 
      })
    }
  } else {
    // Criar novo fornecedor
    sucesso = await addFornecedor(fornecedorData)
    if (sucesso && toast.value) {
      toast.value.success('Fornecedor cadastrado com sucesso!', { 
        position: 'top-right', 
        timeout: 3000 
      })
    }
  }

  if (sucesso) {
    fecharModalFornecedor()
  } else if (toast.value) {
    toast.value.error('Erro ao salvar fornecedor. Tente novamente.', {
      position: 'top-right',
      timeout: 3000
    })
  }
}

function confirmarExclusao(fornecedor: Fornecedor) {
  fornecedorParaExcluir.value = fornecedor
  modalConfirmarExclusao.value = true
}

function fecharModalConfirmarExclusao() {
  modalConfirmarExclusao.value = false
  fornecedorParaExcluir.value = null
}

async function excluirFornecedor() {
  if (fornecedorParaExcluir.value) {
    const sucesso = await deleteFornecedor(fornecedorParaExcluir.value.id)
    
    if (sucesso && toast.value) {
      toast.value.success('Fornecedor excluído com sucesso!', {
        position: 'top-right',
        timeout: 3000
      })
      fecharModalConfirmarExclusao()
    } else if (toast.value) {
      toast.value.error('Erro ao excluir fornecedor. Tente novamente.', {
        position: 'top-right',
        timeout: 3000
      })
    }
  }
}

// Funções de gerenciamento de categorias
function abrirModalGerenciarCategorias() {
  modalGerenciarCategorias.value = true
  novaCategoriaModal.value = ''
}

function fecharModalGerenciarCategorias() {
  modalGerenciarCategorias.value = false
  novaCategoriaModal.value = ''
}

async function adicionarCategoriaModal() {
  if (!novaCategoriaModal.value.trim()) {
    if (toast.value) {
      toast.value.warning('Digite o nome da categoria', {
        position: 'top-right',
        timeout: 2000
      })
    }
    return
  }

  const nomeCategoria = novaCategoriaModal.value.trim()

  // Verificar se já existe
  const existe = await categoriaExiste(nomeCategoria, 'fornecedor')
  if (existe) {
    if (toast.value) {
      toast.value.warning(`A categoria "${nomeCategoria}" já existe!`, {
        position: 'top-right',
        timeout: 2500
      })
    }
    novaCategoriaModal.value = ''
    return
  }

  // Salvar no banco
  const categoriaData = await addCategoria({
    nome: nomeCategoria,
    tipo: 'fornecedor'
  })

  if (categoriaData && toast.value) {
    toast.value.success(`Categoria "${nomeCategoria}" criada com sucesso!`, {
      position: 'top-right',
      timeout: 2500
    })
    novaCategoriaModal.value = ''
    console.log('✅ Nova categoria criada no modal:', categoriaData)
  } else if (toast.value) {
    toast.value.error('Erro ao criar categoria. Tente novamente.', {
      position: 'top-right',
      timeout: 3000
    })
  }
}

function confirmarExcluirCategoria(categoria: any) {
  categoriaParaExcluir.value = categoria
  modalConfirmarExcluirCategoria.value = true
}

function fecharModalConfirmarExcluirCategoria() {
  modalConfirmarExcluirCategoria.value = false
  categoriaParaExcluir.value = null
}

async function excluirCategoriaConfirmado() {
  if (!categoriaParaExcluir.value) return

  const resultado = await deleteCategoria(
    categoriaParaExcluir.value.id,
    categoriaParaExcluir.value.nome
  )

  if (resultado.success && toast.value) {
    toast.value.success('Categoria excluída com sucesso!', {
      position: 'top-right',
      timeout: 3000
    })
    fecharModalConfirmarExcluirCategoria()
  } else if (toast.value) {
    toast.value.error(resultado.message || 'Erro ao excluir categoria.', {
      position: 'top-right',
      timeout: 4000
    })
    fecharModalConfirmarExcluirCategoria()
  }
}

// Funções de máscara
function formatarCNPJInput(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  if (valor.length <= 14) {
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2')
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2')
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2')
  }
  
  formFornecedor.value.cnpj = valor
}

function formatarTelefoneInput(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  if (valor.length <= 11) {
    if (valor.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2')
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      // Celular: (00) 00000-0000
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2')
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2')
    }
  }
  
  formFornecedor.value.telefone = valor
}

function formatarWhatsAppInput(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  if (valor.length <= 11) {
    if (valor.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2')
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      // Celular: (00) 00000-0000
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2')
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2')
    }
  }
  
  formFornecedor.value.whatsapp = valor
}

function formatarEstadoInput(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase()
  
  if (valor.length > 2) {
    valor = valor.substring(0, 2)
  }
  
  formFornecedor.value.estado = valor
}
</script>
