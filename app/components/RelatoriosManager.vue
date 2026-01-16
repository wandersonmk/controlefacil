<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header com botões de exportação -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Relatórios de Movimentação</h2>
        <p class="text-sm text-muted-foreground mt-1">Acompanhe todas as entradas e saídas de produtos</p>
        <p v-if="relatoriosFiltrados && relatoriosFiltrados.length > 0" class="text-xs text-muted-foreground mt-1">
          Total de movimentações: <span class="font-semibold text-primary">{{ relatoriosFiltrados.length }}</span>
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="exportToPDF"
          class="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          title="Exportar para PDF"
        >
          <Icon icon="file-pdf" class-name="w-4 h-4" fallback="" />
          <span>PDF</span>
        </button>
        <button
          @click="exportToExcel"
          class="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          title="Exportar para Excel"
        >
          <Icon icon="file-excel" class-name="w-4 h-4" fallback="" />
          <span>Excel</span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtro por Data Inicial -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Inicial</label>
          <input
            v-model="filtros.dataInicial"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary date-input-white-icon"
          />
        </div>

        <!-- Filtro por Data Final -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Final</label>
          <input
            v-model="filtros.dataFinal"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary date-input-white-icon"
          />
        </div>

        <!-- Filtro por Produto -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Produto</label>
          <input
            v-model="filtros.produto"
            type="text"
            placeholder="Digite o nome do produto"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Tipo de Movimentação -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Tipo</label>
          <select
            v-model="filtros.tipo"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os tipos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
            <option value="Ajuste">Ajuste</option>
          </select>
        </div>
      </div>

      <!-- Botões de ação dos filtros -->
      <div class="flex items-center justify-end mt-4">
        <button
          @click="limparFiltros"
          class="flex items-center space-x-2 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors text-sm font-medium"
        >
          <Icon icon="times-circle" class-name="w-4 h-4" fallback="" />
          <span>Limpar Filtros</span>
        </button>
      </div>
    </div>

    <!-- Lista de relatórios -->
    <div class="p-6">
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-muted-foreground animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground mb-2">Carregando relatórios...</h3>
          <p class="text-muted-foreground">Aguarde um momento</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <div class="flex flex-col items-center">
          <Icon icon="exclamation-triangle" class-name="w-12 h-12 text-red-500 mb-4" fallback="" />
          <h3 class="text-lg font-medium text-foreground mb-2">Erro ao carregar relatórios</h3>
          <p class="text-muted-foreground mb-4">{{ error }}</p>
          <button
            @click="recarregarRelatorios"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>

      <!-- Mensagem quando não há relatórios -->
      <div v-else-if="relatoriosFiltrados.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <Icon icon="file-alt" class-name="w-12 h-12 text-muted-foreground/50 mb-4" fallback="" />
          <h3 class="text-lg font-medium text-foreground mb-2">
            {{ filtrosAplicados ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação disponível' }}
          </h3>
          <p class="text-muted-foreground">
            {{ filtrosAplicados ? 'Tente ajustar os filtros para encontrar movimentações.' : 'Quando houver movimentações de estoque, elas aparecerão aqui.' }}
          </p>
        </div>
      </div>

      <!-- Tabela de relatórios -->
      <div class="overflow-x-auto">
        <div style="max-height: 400px; overflow-y: auto; position: relative;">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Produto</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Quantidade</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Tipo</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Valor Unit.</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Valor Total</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Data/Hora</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Observação</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="relatorio in (relatoriosOrdenados ? relatoriosOrdenados.slice(0, relatoriosVisiveis) : [])" 
                :key="relatorio.id"
                class="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <!-- Produto -->
                <td class="py-3 px-3">
                  <div class="flex items-center">
                    <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                      <Icon icon="box" class-name="w-3 h-3 text-primary" fallback="" />
                    </div>
                    <span class="font-medium text-foreground text-sm">{{ relatorio.produto }}</span>
                  </div>
                </td>
                
                <!-- Quantidade -->
                <td class="py-3 px-3">
                  <span class="text-foreground font-semibold text-sm">{{ relatorio.quantidade }}</span>
                </td>
                
                <!-- Tipo -->
                <td class="py-3 px-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="getTipoClass(relatorio.tipo)">
                    {{ relatorio.tipo }}
                  </span>
                </td>
                
                <!-- Valor Unitário -->
                <td class="py-3 px-3">
                  <span class="text-foreground text-sm">R$ {{ relatorio.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
                </td>
                
                <!-- Valor Total -->
                <td class="py-3 px-3">
                  <span class="text-foreground font-semibold text-sm">R$ {{ relatorio.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
                </td>
                
                <!-- Data e Hora -->
                <td class="py-3 px-3">
                  <div class="text-xs">
                    <div class="font-medium text-foreground">{{ relatorio.data }}</div>
                    <div class="text-muted-foreground">{{ relatorio.hora }}</div>
                  </div>
                </td>
                
                <!-- Observação -->
                <td class="py-3 px-3">
                  <span class="text-foreground text-xs">{{ relatorio.observacao }}</span>
                </td>
              </tr>
              
              <tr v-if="relatoriosFiltrados && relatoriosVisiveis < relatoriosFiltrados.length">
                <td :colspan="7" style="padding:0; border:none; background:transparent;">
                  <div ref="relatorioSentinel" style="height: 1px; width: 100%;"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabela de relatórios -->
      <div class="overflow-x-auto">
        <div style="max-height: 700px; overflow-y: auto;">
          <!-- ...existing code... -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Interface para relatório de movimentação
interface Relatorio {
  id: string
  produto: string
  quantidade: number
  tipo: string
  valorUnitario: number
  valorTotal: number
  data: string
  hora: string
  observacao: string
  created_at: string
}

// Interface para filtros
interface Filtros {
  dataInicial: string
  dataFinal: string
  produto: string
  tipo: string
}

// Dados mockados de movimentações
const relatoriosData = ref<Relatorio[]>([
  {
    id: '1',
    produto: 'Arroz Branco 5kg',
    quantidade: 50,
    tipo: 'Entrada',
    valorUnitario: 18.90,
    valorTotal: 945.00,
    data: '14/01/2026',
    hora: '08:30',
    observacao: 'Compra do fornecedor Distribuidora ABC',
    created_at: '2026-01-14T08:30:00'
  },
  {
    id: '2',
    produto: 'Feijão Preto 1kg',
    quantidade: 30,
    tipo: 'Entrada',
    valorUnitario: 7.50,
    valorTotal: 225.00,
    data: '14/01/2026',
    hora: '09:15',
    observacao: 'Reposição de estoque',
    created_at: '2026-01-14T09:15:00'
  },
  {
    id: '3',
    produto: 'Óleo de Soja 900ml',
    quantidade: 15,
    tipo: 'Saída',
    valorUnitario: 8.90,
    valorTotal: 133.50,
    data: '13/01/2026',
    hora: '14:20',
    observacao: 'Venda para cliente Maria Silva',
    created_at: '2026-01-13T14:20:00'
  },
  {
    id: '4',
    produto: 'Açúcar Cristal 1kg',
    quantidade: 100,
    tipo: 'Entrada',
    valorUnitario: 4.20,
    valorTotal: 420.00,
    data: '13/01/2026',
    hora: '10:00',
    observacao: 'Fornecedor Açúcar Doce Ltda',
    created_at: '2026-01-13T10:00:00'
  },
  {
    id: '5',
    produto: 'Macarrão Espaguete 500g',
    quantidade: 25,
    tipo: 'Saída',
    valorUnitario: 3.80,
    valorTotal: 95.00,
    data: '12/01/2026',
    hora: '16:45',
    observacao: 'Venda para cliente João Santos',
    created_at: '2026-01-12T16:45:00'
  },
  {
    id: '6',
    produto: 'Café em Pó 500g',
    quantidade: 5,
    tipo: 'Ajuste',
    valorUnitario: 12.50,
    valorTotal: 62.50,
    data: '12/01/2026',
    hora: '11:30',
    observacao: 'Correção de inventário',
    created_at: '2026-01-12T11:30:00'
  },
  {
    id: '7',
    produto: 'Leite Integral 1L',
    quantidade: 40,
    tipo: 'Entrada',
    valorUnitario: 5.30,
    valorTotal: 212.00,
    data: '11/01/2026',
    hora: '07:45',
    observacao: 'Fornecedor Laticínios Bom Leite',
    created_at: '2026-01-11T07:45:00'
  },
  {
    id: '8',
    produto: 'Sabão em Pó 1kg',
    quantidade: 20,
    tipo: 'Saída',
    valorUnitario: 9.90,
    valorTotal: 198.00,
    data: '11/01/2026',
    hora: '15:00',
    observacao: 'Venda para cliente Ana Costa',
    created_at: '2026-01-11T15:00:00'
  },
  {
    id: '9',
    produto: 'Farinha de Trigo 1kg',
    quantidade: 60,
    tipo: 'Entrada',
    valorUnitario: 5.80,
    valorTotal: 348.00,
    data: '10/01/2026',
    hora: '09:00',
    observacao: 'Compra mensal - Moinho Central',
    created_at: '2026-01-10T09:00:00'
  },
  {
    id: '10',
    produto: 'Detergente Líquido 500ml',
    quantidade: 35,
    tipo: 'Entrada',
    valorUnitario: 2.80,
    valorTotal: 98.00,
    data: '10/01/2026',
    hora: '13:20',
    observacao: 'Fornecedor Limpeza Total',
    created_at: '2026-01-10T13:20:00'
  }
])

const isLoading = ref(false)
const error = ref<string | null>(null)

// Estados reativos
const filtros = ref<Filtros>({
  dataInicial: '',
  dataFinal: '',
  produto: '',
  tipo: ''
})

// Computed para detectar se há filtros ativos automaticamente
const filtrosAplicados = computed(() => {
  return filtros.value.dataInicial !== '' || 
         filtros.value.dataFinal !== '' || 
         filtros.value.lojaOuCnpj !== '' || 
         filtros.value.empresa !== ''
})

// Computed para relatórios filtrados
const relatoriosFiltrados = computed(() => {
  let resultado = relatoriosData.value

  if (filtros.value.dataInicial) {
    resultado = resultado.filter(r => {
      // Converter data do formato DD/MM/YYYY para comparação
      const dataRelatorio = new Date(r.data.split('/').reverse().join('-'))
      const dataFiltro = new Date(filtros.value.dataInicial)
      return dataRelatorio >= dataFiltro
    })
  }

  if (filtros.value.dataFinal) {
    resultado = resultado.filter(r => {
      const dataRelatorio = new Date(r.data.split('/').reverse().join('-'))
      const dataFiltro = new Date(filtros.value.dataFinal)
      return dataRelatorio <= dataFiltro
    })
  }

  if (filtros.value.produto) {
    const termo = filtros.value.produto.toLowerCase()
    resultado = resultado.filter(r => 
      r.produto.toLowerCase().includes(termo)
    )
  }

  if (filtros.value.tipo) {
    resultado = resultado.filter(r =>
      r.tipo && filtros.value.tipo &&
      r.tipo.toLowerCase() === filtros.value.tipo.toLowerCase()
    )
  }

  return resultado
})

// Computed para ordenar relatórios por data de criação (mais novos no topo)
const relatoriosOrdenados = computed(() => {
  return relatoriosFiltrados.value ? [...relatoriosFiltrados.value].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  }) : []
})

// Função para recarregar relatórios (mockado)
const recarregarRelatorios = () => {
  error.value = null
  isLoading.value = false
}

// Função para limpar filtros
function limparFiltros() {
  filtros.value = {
    dataInicial: '',
    dataFinal: '',
    produto: '',
    tipo: ''
  }
}

// Função para obter classes CSS do tipo de movimentação
function getTipoClass(tipo: string) {
  const classes = {
    'Entrada': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'Saída': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    'Ajuste': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }
  return classes[tipo as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

// Função auxiliar para converter data sem problemas de fuso horário
function formatarDataFiltro(dataString: string): string {
  // Separar a data em partes (YYYY-MM-DD)
  const partes = dataString.split('-')
  if (partes.length !== 3 || !partes[0] || !partes[1] || !partes[2]) {
    return dataString // Retorna original se formato inválido
  }
  
  const ano = parseInt(partes[0], 10)
  const mes = parseInt(partes[1], 10) - 1 // Mês é 0-indexado no JS
  const dia = parseInt(partes[2], 10)
  
  // Criar data especificando ano, mês e dia para evitar problemas de UTC
  const data = new Date(ano, mes, dia)
  
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Função para exportar para PDF
async function exportToPDF() {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    console.warn('Exportação PDF só funciona no cliente')
    return
  }

  try {
    // Importação dinâmica para evitar problemas com SSR
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])
    
    // Criar documento PDF em formato A4 paisagem
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Configurar fonte para suporte UTF-8
    doc.setFont('helvetica', 'normal')
    
    // Cores do tema
    const primaryColor: [number, number, number] = [79, 70, 229] // Indigo-600
    const textColor: [number, number, number] = [17, 24, 39] // Gray-900
    const lightGray: [number, number, number] = [243, 244, 246] // Gray-100
    
    // Header do documento
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 297, 40, 'F')
    
    // Logo/Título
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Precify', 20, 20)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistema de Controle', 20, 30)
    
    // Informações do relatório
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatórios de Tickets', 20, 55)
    
    // Data de geração
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(`Gerado em: ${dataFormatada}`, 20, 65)
    doc.text(`Total de registros: ${relatoriosFiltrados.value.length}`, 20, 72)
    
    // Mostrar filtros aplicados se houver
    let yPosicaoAtual = 72
    if (filtrosAplicados.value) {
      yPosicaoAtual += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(79, 70, 229) // Cor primária
      doc.text('Filtros Aplicados:', 20, yPosicaoAtual)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      yPosicaoAtual += 7
      
      if (filtros.value.dataInicial && filtros.value.dataFinal) {
        const dataIni = formatarDataFiltro(filtros.value.dataInicial)
        const dataFim = formatarDataFiltro(filtros.value.dataFinal)
        doc.text(`• Período: ${dataIni} até ${dataFim}`, 20, yPosicaoAtual)
        yPosicaoAtual += 7
      } else if (filtros.value.dataInicial) {
        const dataIni = formatarDataFiltro(filtros.value.dataInicial)
        doc.text(`• Data inicial: ${dataIni}`, 20, yPosicaoAtual)
        yPosicaoAtual += 7
      } else if (filtros.value.dataFinal) {
        const dataFim = formatarDataFiltro(filtros.value.dataFinal)
        doc.text(`• Data final: ${dataFim}`, 20, yPosicaoAtual)
        yPosicaoAtual += 7
      }
      
      if (filtros.value.empresa) {
        doc.text(`• Empresa: ${filtros.value.empresa}`, 20, yPosicaoAtual)
        yPosicaoAtual += 7
      }
      
      if (filtros.value.lojaOuCnpj) {
        doc.text(`• Loja/CNPJ: ${filtros.value.lojaOuCnpj}`, 20, yPosicaoAtual)
        yPosicaoAtual += 7
      }
    }
    
    // Ajustar posição Y da tabela baseado nos filtros
    const startYTabela = yPosicaoAtual + 15
    
    // Preparar dados para a tabela
    const tableData = relatoriosFiltrados.value.map((relatorio, index) => [
      (index + 1).toString(),
      relatorio.nome_pessoa,
      relatorio.telefone,
      relatorio.nome_loja,
      relatorio.cnpj,
      `${relatorio.data_abertura_chamado} ${relatorio.hora_abertura_chamado}`,
      relatorio.motivo_chamado,
      relatorio.nome_empresa
    ])
    
    // Configurar tabela
    autoTable(doc, {
      head: [['#', 'Nome', 'Telefone', 'Loja', 'CNPJ', 'Data/Hora', 'Motivo', 'Empresa']],
      body: tableData,
      startY: startYTabela,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: textColor,
        lineColor: [209, 213, 219],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // #
        1: { cellWidth: 35 }, // Nome
        2: { cellWidth: 30 }, // Telefone
        3: { cellWidth: 35 }, // Loja
        4: { cellWidth: 35 }, // CNPJ
        5: { cellWidth: 35 }, // Data/Hora
        6: { cellWidth: 60 }, // Motivo
        7: { cellWidth: 20 } // Empresa
      },
      margin: { left: 15, right: 15 }
    })
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Linha do footer
      doc.setDrawColor(209, 213, 219)
      doc.line(15, 200, 282, 200)
      
      // Texto do footer
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text('Precify - Sistema de Controle', 15, 208)
      doc.text(`Página ${i} de ${pageCount}`, 282, 208, { align: 'right' })
    }
    
    // Salvar o arquivo
    const nomeArquivo = `relatorios_tickets_${agora.toISOString().split('T')[0]}.pdf`
    doc.save(nomeArquivo)
    
    console.log('PDF de relatórios exportado com sucesso!')
    
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    alert('Erro ao gerar o PDF. Tente novamente.')
  }
}

// Função para exportar para Excel
async function exportToExcel() {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    console.warn('Exportação Excel só funciona no cliente')
    return
  }

  try {
    // Importação dinâmica para evitar problemas com SSR
    const XLSX = await import('xlsx')
    
    // Data de geração
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Preparar dados completos para o Excel
    const dadosCompletos = [
      // Informações do cabeçalho
      ['Precify - Sistema de Controle'],
      ['Relatórios de Tickets'],
      [`Gerado em: ${dataFormatada}`],
      [`Total de registros: ${relatoriosFiltrados.value.length}`]
    ]
    
    // Adicionar filtros aplicados se houver
    if (filtrosAplicados.value) {
      dadosCompletos.push([]) // Linha vazia
      dadosCompletos.push(['Filtros Aplicados:'])
      
      if (filtros.value.dataInicial && filtros.value.dataFinal) {
        const dataIni = formatarDataFiltro(filtros.value.dataInicial)
        const dataFim = formatarDataFiltro(filtros.value.dataFinal)
        dadosCompletos.push([`Período: ${dataIni} até ${dataFim}`])
      } else if (filtros.value.dataInicial) {
        const dataIni = formatarDataFiltro(filtros.value.dataInicial)
        dadosCompletos.push([`Data inicial: ${dataIni}`])
      } else if (filtros.value.dataFinal) {
        const dataFim = formatarDataFiltro(filtros.value.dataFinal)
        dadosCompletos.push([`Data final: ${dataFim}`])
      }
      
      if (filtros.value.empresa) {
        dadosCompletos.push([`Empresa: ${filtros.value.empresa}`])
      }
      
      if (filtros.value.lojaOuCnpj) {
        dadosCompletos.push([`Loja/CNPJ: ${filtros.value.lojaOuCnpj}`])
      }
    }
    
    // Linha vazia e cabeçalho da tabela
    dadosCompletos.push([])
    dadosCompletos.push(['#', 'Nome', 'Telefone', 'Loja', 'CNPJ', 'Data Abertura', 'Hora Abertura', 'Motivo', 'Empresa'])
    
    // Adicionar dados dos relatórios
    relatoriosFiltrados.value.forEach((relatorio, index) => {
      dadosCompletos.push([
        (index + 1).toString(),
        relatorio.nome_pessoa,
        relatorio.telefone,
        relatorio.nome_loja,
        relatorio.cnpj,
        relatorio.data_abertura_chamado,
        relatorio.hora_abertura_chamado,
        relatorio.motivo_chamado,
        relatorio.nome_empresa
      ])
    })
    
    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(dadosCompletos)
    
    // Configurar largura das colunas
    const columnWidths = [
      { wch: 5 },  // #
      { wch: 25 }, // Nome
      { wch: 18 }, // Telefone
      { wch: 25 }, // Loja
      { wch: 20 }, // CNPJ
      { wch: 15 }, // Data
      { wch: 10 }, // Hora
      { wch: 40 }, // Motivo
      { wch: 12 }  // Empresa
    ]
    worksheet['!cols'] = columnWidths
    
    // Mesclar células do cabeçalho (dinâmico baseado nos filtros)
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Título principal
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Subtítulo
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Data
      { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }, // Total
    ]
    
    // Se há filtros, adicionar mesclagens para as linhas de filtros
    if (filtrosAplicados.value) {
      let linhaMerge = 5 // Linha "Filtros Aplicados:"
      merges.push({ s: { r: linhaMerge, c: 0 }, e: { r: linhaMerge, c: 8 } })
      
      // Contar quantas linhas de filtro foram adicionadas
      let linhasExtras = 1 // "Filtros Aplicados:"
      if (filtros.value.dataInicial || filtros.value.dataFinal) linhasExtras++
      if (filtros.value.empresa) linhasExtras++
      if (filtros.value.lojaOuCnpj) linhasExtras++
      
      // Mesclar cada linha de filtro
      for (let i = 1; i < linhasExtras; i++) {
        merges.push({ s: { r: linhaMerge + i, c: 0 }, e: { r: linhaMerge + i, c: 8 } })
      }
    }
    
    worksheet['!merges'] = merges
    
    // Estilizar células específicas
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, size: 14, color: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      }
    }
    
    if (worksheet['A2']) {
      worksheet['A2'].s = {
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center" }
      }
    }
    
    // Estilizar cabeçalho da tabela (linha 6)
    for (let col = 0; col < 9; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col })
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        }
      }
    }
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatórios')
    
    // Salvar o arquivo
    const nomeArquivo = `relatorios_tickets_${agora.toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nomeArquivo)
    
    console.log('Excel de relatórios exportado com sucesso!')
    
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert('Erro ao gerar o arquivo Excel. Tente novamente.')
  }
}

// Infinite scroll
const relatoriosVisiveis = ref(10)
const relatorioSentinel = ref<HTMLElement | null>(null)
let relatorioObserver: IntersectionObserver | null = null

function setupInfiniteScroll() {
  if (relatorioObserver) {
    relatorioObserver.disconnect()
    relatorioObserver = null
  }
  if (relatorioSentinel.value && relatoriosFiltrados.value.length > 10) {
    relatorioObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        if (relatoriosVisiveis.value < relatoriosFiltrados.value.length) {
          relatoriosVisiveis.value += 10
        }
      }
    })
    relatorioObserver.observe(relatorioSentinel.value)
  }
}

onMounted(() => {
  fetchRelatorios()
  nextTick(() => setupInfiniteScroll())
})

watch(
  () => relatoriosFiltrados.value.length,
  () => nextTick(() => setupInfiniteScroll())
)
</script>

<style scoped>
/* Estilizar o ícone do calendário para ficar branco */
.date-input-white-icon::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Para Firefox */
.date-input-white-icon::-moz-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Para Edge/IE */
.date-input-white-icon::-ms-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>

