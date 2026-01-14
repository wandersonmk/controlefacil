<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-primary/5 via-card to-card rounded-2xl border-0 shadow-lg p-6 backdrop-blur-sm">
      <div class="flex items-center justify-end">
        <div class="flex items-center gap-3">
          <button
            @click="mostrarModalSalvar = true"
            class="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white transition-all duration-200 text-sm font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40"
            style="border-radius: 12px;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
            <span>Salvar</span>
          </button>
          <button
            @click="mostrarCalculosSalvos = !mostrarCalculosSalvos"
            class="flex items-center space-x-2 px-5 py-2.5 bg-card hover:bg-muted border-0 text-foreground transition-all duration-200 text-sm font-semibold"
            style="border-radius: 12px;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            <span>Salvos ({{ calculosSalvos.length }})</span>
          </button>
          <button
            @click="limparFormulario"
            class="flex items-center space-x-2 px-5 py-2.5 bg-card hover:bg-red-50 dark:hover:bg-red-900/10 border-0 text-foreground hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 text-sm font-semibold"
            style="border-radius: 12px;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Limpar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Painel de Cálculos Salvos -->
    <div v-if="mostrarCalculosSalvos && calculosSalvos.length > 0" class="bg-card text-card-foreground rounded-lg border-0 shadow-sm p-6">
      <h3 class="text-lg font-semibold text-foreground mb-4">Cálculos Salvos</h3>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div 
          v-for="calculo in calculosSalvos" 
          :key="calculo.id"
          class="flex items-center justify-between p-3 bg-background rounded-lg border-0 transition-colors"
        >
          <div class="flex-1">
            <p class="font-medium text-foreground">{{ calculo.nome }}</p>
            <p class="text-xs text-muted-foreground">{{ calculo.nomeProduto }} • {{ formatarValor(calculo.precoVendaSugerido) }}</p>
            <p class="text-xs text-muted-foreground">Salvo em {{ new Date(calculo.dataSalvo).toLocaleDateString('pt-BR') }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="carregarCalculo(calculo)"
              class="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm transition-colors"
            >
              Carregar
            </button>
            <button
              @click="excluirCalculo(calculo.id)"
              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Salvar Cálculo -->
    <div v-if="mostrarModalSalvar" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="mostrarModalSalvar = false">
      <div class="bg-card rounded-lg shadow-xl w-full max-w-md border-0">
        <div class="p-6">
          <h3 class="text-xl font-semibold text-foreground mb-4">Salvar Cálculo</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Nome do Cálculo</label>
              <input
                v-model="nomeCalculo"
                type="text"
                placeholder="Ex: Açaí 300ml - Janeiro 2026"
                class="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                @keyup.enter="salvarCalculo"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="mostrarModalSalvar = false"
              class="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              @click="salvarCalculo"
              :disabled="!nomeCalculo.trim()"
              class="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulário de Custos -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Custos do Produto Principal -->
        <div class="bg-card text-card-foreground rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
          <h3 class="text-sm font-bold text-foreground mb-4 flex items-center">
            <div class="p-1.5 bg-primary/10 rounded-lg mr-2">
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            Produto Principal
          </h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1.5">Nome do Produto</label>
              <input
                v-model="nomeProduto"
                type="text"
                placeholder="Ex: Açaí 300ml"
                class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Custo Total da Compra (R$)</label>
                <input
                  v-model="custoItemBase"
                  type="text"
                  placeholder="R$ 0,00"
                  @input="formatarMoeda($event, 'custoItemBase')"
                  class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                />
                <p class="text-[10px] text-muted-foreground mt-0.5">Ex: R$ 115,00</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">QTD da embalagem</label>
                <div class="relative">
                  <input
                    v-model="quantidadeTotalDisplay"
                    type="text"
                    :placeholder="placeholderQuantidadeTotal"
                    @input="formatarQuantidade($event, 'total')"
                    @blur="atualizarQuantidadeTotal"
                    class="w-full px-3 py-2 pr-16 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                  />
                  <select
                    v-model="unidadeMedidaTotal"
                    @change="atualizarUnidadesEFormatos"
                    class="select-unit absolute right-0 top-0 h-full w-16 px-1 bg-[var(--select-bg)] hover:bg-[var(--select-hover)] rounded-r-lg text-foreground text-xs font-semibold text-center focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all duration-200"
                  >
                    <option value="un">Un</option>
                    <option value="kg">Kg</option>
                    <option value="g">g</option>
                    <option value="l">L</option>
                    <option value="ml">mL</option>
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                <p class="text-[10px] text-muted-foreground mt-0.5">{{ exemploQuantidadeTotal }}</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Quantidade por Porção</label>
                <div class="relative">
                  <input
                    v-model="quantidadePorPorcaoDisplay"
                    type="text"
                    :placeholder="placeholderQuantidadePorcao"
                    @input="formatarQuantidade($event, 'porcao')"
                    @blur="atualizarQuantidadePorcao"
                    class="w-full px-3 py-2 pr-16 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                  />
                  <select
                    v-model="unidadeMedidaPorcao"
                    @change="atualizarFormatoPorcao"
                    class="select-unit absolute right-0 top-0 h-full w-16 px-1 bg-[var(--select-bg)] hover:bg-[var(--select-hover)] rounded-r-lg text-foreground text-xs font-semibold text-center focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all duration-200"
                  >
                    <option value="un">Un</option>
                    <option value="kg">Kg</option>
                    <option value="g">g</option>
                    <option value="l">L</option>
                    <option value="ml">mL</option>
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                <p class="text-[10px] text-muted-foreground mt-0.5">{{ exemploQuantidadePorcao }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Custos Variáveis - Sistema de Planilha -->
        <div class="bg-card text-card-foreground rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-foreground flex items-center">
              <div class="p-1.5 bg-blue-500/10 rounded-lg mr-2">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              Ingredientes (custos variáveis)
            </h3>
            <button
              @click="adicionarIngrediente"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-medium"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Adicionar
            </button>
          </div>

          <!-- Tabela de Ingredientes -->
          <div v-if="ingredientes.length > 0" class="overflow-x-hidden">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-border/50">
                  <th class="text-left py-2 px-2 font-semibold text-muted-foreground uppercase">Ingrediente</th>
                  <th class="text-left py-2 px-2 font-semibold text-muted-foreground uppercase">Custo/Produto</th>
                  <th class="text-left py-2 px-2 font-semibold text-muted-foreground uppercase">Qtd. Total</th>
                  <th class="text-left py-2 px-2 font-semibold text-muted-foreground uppercase">Un.</th>
                  <th
                    class="text-right py-2 px-2 font-semibold text-muted-foreground uppercase"
                    title="Mostra o custo unitário (g/ml/un/cm) após você informar a Qtd./Porção."
                  >
                    Custo/Unid.
                  </th>
                  <th class="text-left py-2 px-2 font-semibold text-muted-foreground uppercase">Qtd./Porção</th>
                  <th class="text-left py-2 px-2 font-semibold text-muted-foreground uppercase">Un.</th>
                  <th class="text-right py-2 px-2 font-semibold text-muted-foreground uppercase">Custo/Porção</th>
                  <th class="w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="ingrediente in ingredientes" 
                  :key="ingrediente.id"
                  class="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <!-- Nome -->
                  <td class="py-2 px-2">
                    <input
                      v-model="ingrediente.nome"
                      type="text"
                      placeholder="Ex: Leite Condensado"
                      class="w-full px-2 py-1.5 bg-background border border-input rounded text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </td>
                  
                  <!-- Custo Total -->
                  <td class="py-2 px-2">
                    <input
                      :value="ingrediente.custoTotal"
                      type="text"
                      placeholder="R$ 0,00"
                      @input="formatarMoedaIngrediente($event, ingrediente.id)"
                      class="w-24 px-2 py-1.5 bg-background border border-input rounded text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </td>
                  
                  <!-- Quantidade Total -->
                  <td class="py-2 px-2">
                    <input
                      :value="ingrediente.quantidadeTotal"
                      type="text"
                      placeholder="0"
                      @input="formatarQuantidadeIngrediente($event, ingrediente.id, 'total')"
                      class="w-20 px-2 py-1.5 bg-background border border-input rounded text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </td>
                  
                  <!-- Unidade Total -->
                  <td class="py-2 px-2">
                    <select
                      v-model="ingrediente.unidadeTotal"
                      class="select-unit w-16 px-1 py-1.5 bg-[var(--select-bg)] border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                    >
                      <option value="un">Un</option>
                      <option value="kg">Kg</option>
                      <option value="g">g</option>
                      <option value="l">L</option>
                      <option value="ml">mL</option>
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                    </select>
                  </td>

                  <!-- Custo por unidade base (g/ml/un/cm) -->
                  <td class="py-2 px-2 text-right">
                    <div class="leading-tight">
                      <template v-if="porcaoInformada(ingrediente)">
                        <span class="text-xs font-semibold text-foreground">
                          {{ formatarValorUnitario(calcularCustoPorUnidadeBaseIngrediente(ingrediente)) }}
                        </span>
                        <span class="text-[10px] text-muted-foreground">/{{ unidadeBaseIngrediente(ingrediente.unidadeTotal) }}</span>
                      </template>
                      <template v-else>
                        <span class="text-xs text-muted-foreground">—</span>
                      </template>
                    </div>
                  </td>
                  
                  <!-- Quantidade por Porção -->
                  <td class="py-2 px-2">
                    <input
                      :value="ingrediente.quantidadePorPorcao"
                      type="text"
                      placeholder="0"
                      @input="formatarQuantidadeIngrediente($event, ingrediente.id, 'porcao')"
                      class="w-20 px-2 py-1.5 bg-background border border-input rounded text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </td>
                  
                  <!-- Unidade Porção -->
                  <td class="py-2 px-2">
                    <select
                      v-model="ingrediente.unidadePorPorcao"
                      class="select-unit w-16 px-1 py-1.5 bg-[var(--select-bg)] border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                    >
                      <option value="un">Un</option>
                      <option value="kg">Kg</option>
                      <option value="g">g</option>
                      <option value="l">L</option>
                      <option value="ml">mL</option>
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                    </select>
                  </td>
                  
                  <!-- Custo por Porção (calculado) -->
                  <td class="py-2 px-2 text-right">
                    <span class="text-xs font-bold text-primary">
                      {{ formatarValor(calcularCustoPorPorcaoIngrediente(ingrediente)) }}
                    </span>
                  </td>
                  
                  <!-- Botão Remover -->
                  <td class="py-2 px-2">
                    <button
                      @click="removerIngrediente(ingrediente.id)"
                      class="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                      title="Remover ingrediente"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-primary/20">
                  <td colspan="7" class="py-2 px-2 text-right">
                    <span class="text-xs font-bold text-foreground uppercase">Custo/Produto:</span>
                  </td>
                  <td class="py-2 px-2 text-right">
                    <span class="text-sm font-black text-primary">{{ formatarValor(custoTotalIngredientes) }}</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Mensagem quando não há ingredientes -->
          <div v-else class="text-center py-6">
            <svg class="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <p class="text-xs text-muted-foreground">Nenhum ingrediente adicionado</p>
            <p class="text-xs text-muted-foreground/60 mt-1">Clique em "Adicionar" para começar</p>
          </div>

          <!-- Custos Variáveis Adicionais -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/30">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1.5">Embalagem (R$)</label>
              <input
                v-model="custoEmbalagem"
                type="text"
                placeholder="R$ 0,00"
                @input="formatarMoeda($event, 'custoEmbalagem')"
                class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
              />
              <p class="text-[10px] text-muted-foreground mt-0.5">Copo, pote, sacola, etc.</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-foreground mb-1.5">Outros Custos (R$)</label>
              <input
                v-model="outrosCustosVariaveis"
                type="text"
                placeholder="R$ 0,00"
                @input="formatarMoeda($event, 'outrosCustosVariaveis')"
                class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
              />
              <p class="text-[10px] text-muted-foreground mt-0.5">Delivery, taxas, etc.</p>
            </div>
          </div>
        </div>

        <!-- Custos Fixos -->
        <div class="bg-card text-card-foreground rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-foreground flex items-center">
              <div class="p-1.5 bg-orange-500/10 rounded-lg mr-2">
                <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              Custos Fixos Mensais
            </h3>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="incluirCustosFixos"
                type="checkbox"
                class="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
              />
              <span class="text-xs text-foreground">Incluir custos fixos</span>
            </label>
          </div>

          <div v-if="incluirCustosFixos" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Aluguel (R$)</label>
                <input
                  v-model="custoAluguel"
                  type="text"
                  placeholder="R$ 0,00"
                  @input="formatarMoeda($event, 'custoAluguel')"
                  class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Água (R$)</label>
                <input
                  v-model="custoAgua"
                  type="text"
                  placeholder="R$ 0,00"
                  @input="formatarMoeda($event, 'custoAgua')"
                  class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Energia Elétrica (R$)</label>
                <input
                  v-model="custoEnergia"
                  type="text"
                  placeholder="R$ 0,00"
                  @input="formatarMoeda($event, 'custoEnergia')"
                  class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Mão de Obra (R$)</label>
                <input
                  v-model="custoMaoDeObra"
                  type="text"
                  placeholder="R$ 0,00"
                  @input="formatarMoeda($event, 'custoMaoDeObra')"
                  class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Outros Fixos (R$)</label>
                <input
                  v-model="outrosCustosFixos"
                  type="text"
                  placeholder="R$ 0,00"
                  @input="formatarMoeda($event, 'outrosCustosFixos')"
                  class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1.5">Vendas Estimadas/Mês</label>
                <input
                  v-model.number="vendasEstimadas"
                  type="number"
                  placeholder="0"
                  class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                />
                <p class="text-[10px] text-muted-foreground mt-0.5">Quantidade de vendas por mês</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Painel de Resultados -->
      <div class="lg:col-span-1">
        <div class="bg-card rounded-xl border-0 shadow-lg p-3 sticky top-6">
          <h3 class="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            Resultados
          </h3>

          <div class="space-y-2">
            <!-- Custo do Produto Base -->
            <div class="bg-background/50 rounded-lg p-2 border-0">
              <p class="text-[10px] text-muted-foreground mb-0.5">Custo do Produto Base</p>
              <p class="text-xs font-bold text-foreground">{{ formatarValor(custoProdutoBase) }}</p>
            </div>

            <!-- Custo Variável Total -->
            <div class="bg-background/50 rounded-lg p-2 border-0">
              <p class="text-[10px] text-muted-foreground mb-0.5">Custo Variável por Porção</p>
              <p class="text-xs font-bold text-foreground">{{ formatarValor(custoVariavelTotal) }}</p>
            </div>

            <!-- Custo Fixo por Unidade -->
            <div v-if="incluirCustosFixos" class="bg-background/50 rounded-lg p-2 border-0">
              <p class="text-[10px] text-muted-foreground mb-0.5">Custo Fixo por Unidade</p>
              <p class="text-xs font-bold text-foreground">{{ formatarValor(custoFixoPorUnidade) }}</p>
            </div>

            <!-- Custo Total por Unidade -->
            <div class="bg-primary/5 rounded-lg p-2 border-0">
              <p class="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase">Custo Total</p>
              <p class="text-sm font-black text-primary">{{ formatarValor(custoTotalPorUnidade) }}</p>
            </div>

            <!-- Divisor -->
            <div class="border-t border-border/50 my-1.5"></div>

            <!-- Preço Sugerido -->
            <div class="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-2.5 border-0">
              <div class="flex items-center gap-1 mb-1">
                <svg class="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <p class="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase">Preço Sugerido</p>
              </div>
              <p class="text-base font-black text-green-600 dark:text-green-400">{{ formatarValor(precoVendaSugerido) }}</p>
            </div>

            <!-- Lucro -->
            <div class="bg-green-500/5 rounded-lg p-2 border-0">
              <div class="flex items-center justify-between mb-0.5">
                <p class="text-[10px] text-green-700 dark:text-green-300">Lucro por Unidade</p>
                <span class="text-[10px] font-bold text-green-600 dark:text-green-400">{{ margemLucroCalculada.toFixed(1) }}%</span>
              </div>
              <p :class="lucroPorUnidade >= 0 ? 'text-xs font-bold text-green-600 dark:text-green-400' : 'text-xs font-bold text-red-600 dark:text-red-400'">{{ formatarValor(lucroPorUnidade) }}</p>
            </div>

            <!-- Informações Adicionais -->
            <div v-if="quantidadeTotal > 0 && quantidadePorPorcao > 0" class="bg-background/50 rounded-lg p-2 border-0">
              <!-- Destaque para Porções -->
              <div class="bg-primary/5 rounded-lg p-2 mb-2">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-[10px] font-semibold text-primary">Total de Porções:</span>
                  <span class="text-base font-black text-primary">{{ porcoesTotais.toFixed(0) }}</span>
                </div>
                <p class="text-[10px] text-muted-foreground">{{ quantidadeTotal }} {{ unidadeMedidaTotal }} ÷ {{ quantidadePorPorcao }} {{ unidadeMedidaPorcao }} = <span class="font-bold text-primary">{{ porcoesTotais.toFixed(0) }} porções</span></p>
                <p class="text-[9px] text-muted-foreground/60 mt-0.5 italic">* Valor aproximado</p>
              </div>
              
              <!-- Resumo Financeiro -->
              <div class="bg-muted/30 rounded-lg p-2">
                <p class="text-[10px] font-bold text-foreground mb-1.5">💰 Se vender todas as {{ porcoesTotais.toFixed(0) }} porções:</p>
                <div class="space-y-1 text-[10px]">
                  <div class="flex justify-between items-center">
                    <span class="text-muted-foreground">Receita Total:</span>
                    <div class="text-right">
                      <span class="font-bold text-foreground block text-xs">{{ formatarValor(receitaTotal) }}</span>
                      <span class="text-[9px] text-muted-foreground/60">{{ porcoesTotais.toFixed(2) }} × {{ formatarValor(precoVendaSugerido) }}</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center pt-0.5 border-t border-border/50">
                    <span class="text-muted-foreground">Lucro Total:</span>
                    <div class="text-right">
                      <span :class="lucroTotal >= 0 ? 'font-bold text-green-600 dark:text-green-400 block text-xs' : 'font-bold text-red-600 dark:text-red-400 block text-xs'">{{ formatarValor(lucroTotal) }}</span>
                      <span class="text-[9px] text-muted-foreground/60">{{ porcoesTotais.toFixed(2) }} × {{ formatarValor(lucroPorUnidade) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Divisor -->
            <div class="border-t border-border/50 my-2"></div>

            <!-- Preço de Venda Desejado -->
            <div class="bg-blue-500/5 rounded-lg p-3 border-0">
              <label class="block text-[10px] font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase">
                💵 Definir Preço de Venda
              </label>
              <input
                :value="precoVendaManual"
                type="text"
                placeholder="R$ 0,00"
                @input="atualizarMargemPorPreco"
                :class="[
                  'w-full px-3 py-2 bg-background border rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all duration-200',
                  (precoAbaixoCusto || lucroPorUnidade < 0) 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-input focus:ring-primary focus:border-primary hover:border-primary/50'
                ]"
              />
              <div v-if="precoAbaixoCusto || lucroPorUnidade < 0" class="flex items-start gap-1.5 mt-1.5 p-2 bg-red-500/10 rounded border border-red-500/20">
                <svg class="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <p class="text-[9px] text-red-600 dark:text-red-400 leading-tight">
                  ⚠️ Preço abaixo do custo! Você terá <span class="font-bold">prejuízo</span> de {{ formatarValor(Math.abs(lucroPorUnidade)) }} por unidade.
                </p>
              </div>
              <p class="text-[9px] text-muted-foreground mt-1">Digite o preço que deseja vender (ajusta a margem automaticamente)</p>
            </div>

            <!-- Margem de Lucro -->
            <div class="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-3 border-0">
              <h3 class="text-[10px] font-bold text-green-700 dark:text-green-300 mb-2 flex items-center gap-1.5 uppercase">
                <svg class="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Margem de Lucro
              </h3>

              <div class="space-y-2">
                <input
                  v-model.number="margemLucro"
                  type="range"
                  min="0"
                  max="1000"
                  step="5"
                  @input="aoAlterarMargem"
                  class="w-full h-2.5 bg-green-200 dark:bg-green-900/30 rounded-lg appearance-none cursor-pointer slider-green"
                  style="accent-color: #16a34a;"
                />
                <div class="flex items-center justify-center gap-2 bg-background rounded-lg px-3 py-1.5 border border-input">
                  <input
                    v-model.number="margemLucro"
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    @input="aoAlterarMargem"
                    class="w-16 bg-transparent text-foreground text-center focus:outline-none font-bold text-sm"
                  />
                  <span class="text-foreground font-semibold text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Interface para cálculo salvo
interface CalculoSalvo {
  id: string
  nome: string
  dataSalvo: string
  nomeProduto: string
  custoItemBase: string
  quantidadeTotal: number
  quantidadePorPorcao: number
  unidadeMedidaTotal: string
  unidadeMedidaPorcao: string
  custoEmbalagem: string
  outrosCustosVariaveis: string
  incluirCustosFixos: boolean
  custoAluguel: string
  custoAgua: string
  custoEnergia: string
  custoMaoDeObra: string
  outrosCustosFixos: string
  vendasEstimadas: number
  margemLucro: number
  precoVendaSugerido: number
}

// Estado do formulário
const nomeProduto = ref('')
const custoItemBase = ref('R$ 0,00')
const quantidadeTotal = ref(0)
const quantidadePorPorcao = ref(0)

// Unidades de medida separadas
const unidadeMedidaTotal = ref('l')
const unidadeMedidaPorcao = ref('l')

// Valores formatados para display
const quantidadeTotalDisplay = ref('')
const quantidadePorPorcaoDisplay = ref('')

// Custos variáveis - Sistema de ingredientes
interface Ingrediente {
  id: string
  nome: string
  custoTotal: string
  quantidadeTotal: string
  unidadeTotal: 'un' | 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm'
  quantidadePorPorcao: string
  unidadePorPorcao: 'un' | 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm'
}

const ingredientes = ref<Ingrediente[]>([])

// Função para adicionar novo ingrediente
function adicionarIngrediente() {
  ingredientes.value.push({
    id: Date.now().toString(),
    nome: '',
    custoTotal: 'R$ 0,00',
    quantidadeTotal: '',
    unidadeTotal: 'g',
    quantidadePorPorcao: '',
    unidadePorPorcao: 'g'
  })
}

// Função para remover ingrediente
function removerIngrediente(id: string) {
  ingredientes.value = ingredientes.value.filter(ing => ing.id !== id)
}

// Custos variáveis adicionais
const custoEmbalagem = ref('R$ 0,00')
const outrosCustosVariaveis = ref('R$ 0,00')

// Custos fixos
const incluirCustosFixos = ref(false)
const custoAluguel = ref('R$ 0,00')
const custoAgua = ref('R$ 0,00')
const custoEnergia = ref('R$ 0,00')
const custoMaoDeObra = ref('R$ 0,00')
const outrosCustosFixos = ref('R$ 0,00')
const vendasEstimadas = ref(0)

// Margem de lucro
const margemLucro = ref(50)

// Preço de venda manual
const precoVendaManual = ref('')
const usandoPrecoManual = ref(false)

// Função para atualizar margem baseado no preço manual
function atualizarMargemPorPreco(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  if (valor === '') {
    precoVendaManual.value = ''
    usandoPrecoManual.value = false
    return
  }
  
  const numero = parseInt(valor) / 100
  const formatado = 'R$ ' + numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  precoVendaManual.value = formatado
  usandoPrecoManual.value = true
  
  // Calcular margem de lucro baseado no preço inserido
  const precoManualNumero = moedaParaNumero(formatado)
  if (custoTotalPorUnidade.value > 0 && precoManualNumero > 0) {
    const margemCalculada = ((precoManualNumero - custoTotalPorUnidade.value) / custoTotalPorUnidade.value) * 100
    margemLucro.value = Math.round(margemCalculada * 10) / 10 // Arredondar para 1 casa decimal
  }
}

// Função para quando o slider/input de margem for alterado
function aoAlterarMargem() {
  usandoPrecoManual.value = false
  precoVendaManual.value = ''
}

// Computed para verificar se o preço é menor que o custo
const precoAbaixoCusto = computed(() => {
  if (!usandoPrecoManual.value || !precoVendaManual.value) return false
  const precoManualNumero = moedaParaNumero(precoVendaManual.value)
  return precoManualNumero < custoTotalPorUnidade.value
})

// Estado para salvar cálculos
const mostrarModalSalvar = ref(false)
const nomeCalculo = ref('')
const calculosSalvos = ref<CalculoSalvo[]>([])
const mostrarCalculosSalvos = ref(false)

// Carregar cálculos salvos do localStorage ao montar
onMounted(() => {
  if (process.client) {
    const salvos = localStorage.getItem('calculadora-calculos')
    if (salvos) {
      try {
        calculosSalvos.value = JSON.parse(salvos)
      } catch (error) {
        console.error('Erro ao carregar cálculos salvos:', error)
      }
    }
  }
})

// Funções auxiliares
function moedaParaNumero(valor: string): number {
  return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}

function formatarMoeda(event: Event, campo: 'custoItemBase' | 'custoEmbalagem' | 'outrosCustosVariaveis' | 'custoAluguel' | 'custoAgua' | 'custoEnergia' | 'custoMaoDeObra' | 'outrosCustosFixos') {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  const refs: Record<string, any> = {
    custoItemBase,
    custoEmbalagem,
    outrosCustosVariaveis,
    custoAluguel,
    custoAgua,
    custoEnergia,
    custoMaoDeObra,
    outrosCustosFixos
  }
  
  if (valor === '') {
    refs[campo].value = 'R$ 0,00'
    return
  }
  
  const numero = parseInt(valor) / 100
  const formatado = 'R$ ' + numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  refs[campo].value = formatado
}

function formatarValor(valor: number): string {
  return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatarValorUnitario(valor: number): string {
  return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Funções para ingredientes
function formatarMoedaIngrediente(event: Event, ingredienteId: string) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  
  if (valor === '') {
    const ingrediente = ingredientes.value.find(ing => ing.id === ingredienteId)
    if (ingrediente) ingrediente.custoTotal = 'R$ 0,00'
    return
  }
  
  const numero = parseInt(valor) / 100
  const formatado = 'R$ ' + numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  const ingrediente = ingredientes.value.find(ing => ing.id === ingredienteId)
  if (ingrediente) ingrediente.custoTotal = formatado
}

function formatarQuantidadeIngrediente(event: Event, ingredienteId: string, campo: 'total' | 'porcao') {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/[^\d,.]/g, '').replace('.', ',')
  
  // Permitir apenas números e uma vírgula
  const partes = valor.split(',')
  if (partes.length > 2) {
    valor = partes[0] + ',' + partes.slice(1).join('')
  }
  
  const ingrediente = ingredientes.value.find(ing => ing.id === ingredienteId)
  if (ingrediente) {
    if (campo === 'total') {
      ingrediente.quantidadeTotal = valor
    } else {
      ingrediente.quantidadePorPorcao = valor
    }
  }
}

function porcaoInformada(ingrediente: Ingrediente): boolean {
  const quantidadePorPorcao = parseFloat(ingrediente.quantidadePorPorcao.replace(',', '.')) || 0
  return quantidadePorPorcao > 0
}

function unidadeBaseIngrediente(unidade: Ingrediente['unidadeTotal']): 'g' | 'ml' | 'cm' | 'un' {
  if (unidade === 'kg' || unidade === 'g') return 'g'
  if (unidade === 'l' || unidade === 'ml') return 'ml'
  if (unidade === 'm' || unidade === 'cm') return 'cm'
  return 'un'
}

function calcularCustoPorUnidadeBaseIngrediente(ingrediente: Ingrediente): number {
  const custoTotal = moedaParaNumero(ingrediente.custoTotal)
  const quantidadeTotal = parseFloat(ingrediente.quantidadeTotal.replace(',', '.')) || 0

  if (custoTotal === 0 || quantidadeTotal === 0) {
    return 0
  }

  const quantidadeTotalBase = converterParaUnidadeBase(quantidadeTotal, ingrediente.unidadeTotal)
  if (quantidadeTotalBase === 0) return 0

  return custoTotal / quantidadeTotalBase
}

// Calcular custo por porção de um ingrediente
function calcularCustoPorPorcaoIngrediente(ingrediente: Ingrediente): number {
  const custoTotal = moedaParaNumero(ingrediente.custoTotal)
  const quantidadeTotal = parseFloat(ingrediente.quantidadeTotal.replace(',', '.')) || 0
  const quantidadePorPorcao = parseFloat(ingrediente.quantidadePorPorcao.replace(',', '.')) || 0
  
  if (custoTotal === 0 || quantidadeTotal === 0 || quantidadePorPorcao === 0) {
    return 0
  }
  
  // Converter ambas para a mesma unidade base
  const quantidadeTotalBase = converterParaUnidadeBase(quantidadeTotal, ingrediente.unidadeTotal)
  const quantidadePorPorcaoBase = converterParaUnidadeBase(quantidadePorPorcao, ingrediente.unidadePorPorcao)
  
  // Calcular custo unitário e depois multiplicar pela quantidade da porção
  const custoPorUnidadeBase = custoTotal / quantidadeTotalBase
  const custoPorPorcao = custoPorUnidadeBase * quantidadePorPorcaoBase
  
  return custoPorPorcao
}

// Computed para soma total dos ingredientes
const custoTotalIngredientes = computed(() => {
  return ingredientes.value.reduce((total, ingrediente) => {
    return total + calcularCustoPorPorcaoIngrediente(ingrediente)
  }, 0)
})

// Funções para formatar quantidade baseado na unidade
function formatarQuantidade(event: Event, tipo: 'total' | 'porcao') {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/[^\d,.]/g, '')
  
  // Substituir ponto por vírgula para padronizar
  valor = valor.replace('.', ',')
  
  // Permitir apenas números e uma vírgula
  const partes = valor.split(',')
  if (partes.length > 2) {
    valor = partes[0] + ',' + partes.slice(1).join('')
  }
  
  if (tipo === 'total') {
    quantidadeTotalDisplay.value = valor
  } else {
    quantidadePorPorcaoDisplay.value = valor
  }
}

function atualizarQuantidadeTotal() {
  const valor = quantidadeTotalDisplay.value.replace(',', '.')
  quantidadeTotal.value = parseFloat(valor) || 0
}

function atualizarQuantidadePorcao() {
  const valor = quantidadePorPorcaoDisplay.value.replace(',', '.')
  quantidadePorPorcao.value = parseFloat(valor) || 0
}

function atualizarUnidadesEFormatos() {
  // Quando mudar unidade total, atualizar a unidade da porção também
  unidadeMedidaPorcao.value = unidadeMedidaTotal.value
}

function atualizarFormatoPorcao() {
  // Função chamada quando muda a unidade da porção
}

// Computed para placeholders e exemplos
const placeholderQuantidadeTotal = computed(() => {
  const exemplos: Record<string, string> = {
    'un': '10',
    'kg': '5',
    'g': '1000',
    'l': '10',
    'ml': '5000',
    'm': '100',
    'cm': '10000'
  }
  return exemplos[unidadeMedidaTotal.value] || '0'
})

const placeholderQuantidadePorcao = computed(() => {
  const exemplos: Record<string, string> = {
    'un': '1',
    'kg': '0,5',
    'g': '300',
    'l': '0,3',
    'ml': '300',
    'm': '1',
    'cm': '100'
  }
  return exemplos[unidadeMedidaPorcao.value] || '0'
})

const exemploQuantidadeTotal = computed(() => {
  const exemplos: Record<string, string> = {
    'un': 'Ex: 10 unidades',
    'kg': 'Ex: 5 kg',
    'g': 'Ex: 1000 (para 1kg)',
    'l': 'Ex: 10 litros',
    'ml': 'Ex: 5000 (para 5L)',
    'm': 'Ex: 100 metros',
    'cm': 'Ex: 10000 (para 100m)'
  }
  return exemplos[unidadeMedidaTotal.value] || `Ex: 10 ${unidadeMedidaTotal.value}`
})

const exemploQuantidadePorcao = computed(() => {
  const exemplos: Record<string, string> = {
    'un': 'Ex: 1 unidade',
    'kg': 'Ex: 0,5 (para 500g)',
    'g': 'Ex: 300 (direto)',
    'l': 'Ex: 0,3 (para 300ml)',
    'ml': 'Ex: 300 (direto)',
    'm': 'Ex: 1 metro',
    'cm': 'Ex: 100 (direto)'
  }
  return exemplos[unidadeMedidaPorcao.value] || `Ex: 1 ${unidadeMedidaPorcao.value}`
})

function limparFormulario() {
  nomeProduto.value = ''
  custoItemBase.value = 'R$ 0,00'
  quantidadeTotal.value = 0
  quantidadePorPorcao.value = 0
  quantidadeTotalDisplay.value = ''
  quantidadePorPorcaoDisplay.value = ''
  unidadeMedidaTotal.value = 'l'
  unidadeMedidaPorcao.value = 'l'
  ingredientes.value = []
  custoEmbalagem.value = 'R$ 0,00'
  outrosCustosVariaveis.value = 'R$ 0,00'
  incluirCustosFixos.value = false
  custoAluguel.value = 'R$ 0,00'
  custoAgua.value = 'R$ 0,00'
  custoEnergia.value = 'R$ 0,00'
  custoMaoDeObra.value = 'R$ 0,00'
  outrosCustosFixos.value = 'R$ 0,00'
  vendasEstimadas.value = 0
  margemLucro.value = 50
}

// Função para salvar cálculo
function salvarCalculo() {
  if (!nomeCalculo.value.trim()) return

  const novoCalculo: CalculoSalvo = {
    id: Date.now().toString(),
    nome: nomeCalculo.value,
    dataSalvo: new Date().toISOString(),
    nomeProduto: nomeProduto.value,
    custoItemBase: custoItemBase.value,
    quantidadeTotal: quantidadeTotal.value,
    quantidadePorPorcao: quantidadePorPorcao.value,
    unidadeMedidaTotal: unidadeMedidaTotal.value,
    unidadeMedidaPorcao: unidadeMedidaPorcao.value,
    custoEmbalagem: custoEmbalagem.value,
    outrosCustosVariaveis: outrosCustosVariaveis.value,
    incluirCustosFixos: incluirCustosFixos.value,
    custoAluguel: custoAluguel.value,
    custoAgua: custoAgua.value,
    custoEnergia: custoEnergia.value,
    custoMaoDeObra: custoMaoDeObra.value,
    outrosCustosFixos: outrosCustosFixos.value,
    vendasEstimadas: vendasEstimadas.value,
    margemLucro: margemLucro.value,
    precoVendaSugerido: precoVendaSugerido.value
  }

  calculosSalvos.value.push(novoCalculo)
  
  // Salvar no localStorage
  if (process.client) {
    localStorage.setItem('calculadora-calculos', JSON.stringify(calculosSalvos.value))
  }

  // Resetar modal
  mostrarModalSalvar.value = false
  nomeCalculo.value = ''
  mostrarCalculosSalvos.value = true
}

// Função para carregar cálculo
function carregarCalculo(calculo: CalculoSalvo) {
  nomeProduto.value = calculo.nomeProduto
  custoItemBase.value = calculo.custoItemBase
  quantidadeTotal.value = calculo.quantidadeTotal
  quantidadePorPorcao.value = calculo.quantidadePorPorcao
  
  // Atualizar displays
  quantidadeTotalDisplay.value = calculo.quantidadeTotal.toString().replace('.', ',')
  quantidadePorPorcaoDisplay.value = calculo.quantidadePorPorcao.toString().replace('.', ',')
  
  // Suporte para formato antigo e novo
  unidadeMedidaTotal.value = calculo.unidadeMedidaTotal || (calculo as any).unidadeMedida || 'l'
  unidadeMedidaPorcao.value = calculo.unidadeMedidaPorcao || (calculo as any).unidadeMedida || 'l'
  
  custoEmbalagem.value = calculo.custoEmbalagem
  outrosCustosVariaveis.value = calculo.outrosCustosVariaveis
  incluirCustosFixos.value = calculo.incluirCustosFixos
  custoAluguel.value = calculo.custoAluguel
  custoAgua.value = calculo.custoAgua
  custoEnergia.value = calculo.custoEnergia
  custoMaoDeObra.value = calculo.custoMaoDeObra
  outrosCustosFixos.value = calculo.outrosCustosFixos
  vendasEstimadas.value = calculo.vendasEstimadas
  margemLucro.value = calculo.margemLucro
  
  mostrarCalculosSalvos.value = false
}

// Função para excluir cálculo
function excluirCalculo(id: string) {
  if (!confirm('Tem certeza que deseja excluir este cálculo?')) return
  
  calculosSalvos.value = calculosSalvos.value.filter(c => c.id !== id)
  
  // Atualizar localStorage
  if (process.client) {
    localStorage.setItem('calculadora-calculos', JSON.stringify(calculosSalvos.value))
  }
}

// Função para converter unidades para uma base comum
function converterParaUnidadeBase(valor: number, unidade: string): number {
  // Converter tudo para a menor unidade em cada categoria
  const conversoes: Record<string, number> = {
    // Peso - base: gramas (g)
    'g': 1,
    'kg': 1000,
    // Volume - base: mililitros (mL)
    'ml': 1,
    'l': 1000,
    // Comprimento - base: centímetros (cm)
    'cm': 1,
    'm': 100,
    // Unidade - sem conversão
    'un': 1
  }
  
  return valor * (conversoes[unidade] || 1)
}

// Função para converter entre categorias diferentes (peso <-> volume)
function converterEntreUnidades(valorOrigem: number, unidadeOrigem: string, unidadeDestino: string): number {
  // Se são da mesma categoria, usa conversão direta
  const pesoUnits = ['g', 'kg']
  const volumeUnits = ['ml', 'l']
  
  const origemPeso = pesoUnits.includes(unidadeOrigem)
  const destinoPeso = pesoUnits.includes(unidadeDestino)
  const origemVolume = volumeUnits.includes(unidadeOrigem)
  const destinoVolume = volumeUnits.includes(unidadeDestino)
  
  // Mesma categoria - conversão normal
  if ((origemPeso && destinoPeso) || (origemVolume && destinoVolume)) {
    const valorBaseOrigem = converterParaUnidadeBase(valorOrigem, unidadeOrigem)
    const valorBaseDestino = converterParaUnidadeBase(1, unidadeDestino)
    return valorBaseOrigem / valorBaseDestino
  }
  
  // Conversão entre peso e volume (aproximação: 1g = 1ml)
  if ((origemPeso && destinoVolume) || (origemVolume && destinoPeso)) {
    const valorEmBaseOrigem = converterParaUnidadeBase(valorOrigem, unidadeOrigem)
    const valorEmBaseDestino = converterParaUnidadeBase(1, unidadeDestino)
    return valorEmBaseOrigem / valorEmBaseDestino
  }
  
  // Sem conversão possível
  return valorOrigem
}

// Cálculos
const custoProdutoBase = computed(() => {
  if (quantidadeTotal.value === 0 || quantidadePorPorcao.value === 0) return 0
  
  const custoTotal = moedaParaNumero(custoItemBase.value)
  
  // Converter ambas as quantidades para a mesma unidade base
  const totalNaUnidadeBase = converterParaUnidadeBase(quantidadeTotal.value, unidadeMedidaTotal.value)
  const porcaoNaUnidadeBase = converterParaUnidadeBase(quantidadePorPorcao.value, unidadeMedidaPorcao.value)
  
  // Calcular custo por unidade base e multiplicar pela quantidade da porção
  return (custoTotal / totalNaUnidadeBase) * porcaoNaUnidadeBase
})

const custoVariavelTotal = computed(() => {
  return custoProdutoBase.value +
    custoTotalIngredientes.value +
    moedaParaNumero(custoEmbalagem.value) +
    moedaParaNumero(outrosCustosVariaveis.value)
})

const custoFixoMensal = computed(() => {
  if (!incluirCustosFixos.value) return 0
  return moedaParaNumero(custoAluguel.value) +
    moedaParaNumero(custoAgua.value) +
    moedaParaNumero(custoEnergia.value) +
    moedaParaNumero(custoMaoDeObra.value) +
    moedaParaNumero(outrosCustosFixos.value)
})

const custoFixoPorUnidade = computed(() => {
  if (!incluirCustosFixos.value || vendasEstimadas.value === 0) return 0
  return custoFixoMensal.value / vendasEstimadas.value
})

const custoTotalPorUnidade = computed(() => {
  return custoVariavelTotal.value + custoFixoPorUnidade.value
})

const precoVendaSugerido = computed(() => {
  // Se estiver usando preço manual, usar ele
  if (usandoPrecoManual.value && precoVendaManual.value) {
    return moedaParaNumero(precoVendaManual.value)
  }
  // Caso contrário, calcular baseado na margem
  if (custoTotalPorUnidade.value === 0) return 0
  return custoTotalPorUnidade.value * (1 + margemLucro.value / 100)
})

const lucroPorUnidade = computed(() => {
  return precoVendaSugerido.value - custoTotalPorUnidade.value
})

const margemLucroCalculada = computed(() => {
  if (custoTotalPorUnidade.value === 0) return 0
  return (lucroPorUnidade.value / custoTotalPorUnidade.value) * 100
})

const porcoesTotais = computed(() => {
  if (quantidadePorPorcao.value === 0) return 0
  
  // Converter ambas as quantidades para a mesma unidade base antes de calcular
  const totalNaUnidadeBase = converterParaUnidadeBase(quantidadeTotal.value, unidadeMedidaTotal.value)
  const porcaoNaUnidadeBase = converterParaUnidadeBase(quantidadePorPorcao.value, unidadeMedidaPorcao.value)
  
  if (porcaoNaUnidadeBase === 0) return 0
  return totalNaUnidadeBase / porcaoNaUnidadeBase
})

const receitaTotal = computed(() => {
  return precoVendaSugerido.value * porcoesTotais.value
})

const lucroTotal = computed(() => {
  return lucroPorUnidade.value * porcoesTotais.value
})
</script>







