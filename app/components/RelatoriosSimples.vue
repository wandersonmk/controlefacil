<template>
  <div class="space-y-6">
    <!-- Cabeçalho com Filtros e Exportação -->
    <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
      <div class="p-6 border-b border-border">
        <div class="flex flex-col md:flex-row md:items-center justify-end gap-4">
          <!-- Botões de Exportação -->
          <div class="flex items-center gap-2">
            <button
              @click="exportarPDF"
              class="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              title="Exportar para PDF"
            >
              <Icon icon="file-pdf" :class-name="'w-4 h-4'" fallback="" />
              <span class="hidden sm:inline">PDF</span>
            </button>
            <button
              @click="exportarExcel"
              class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              title="Exportar para Excel"
            >
              <Icon icon="file-excel" :class-name="'w-4 h-4'" fallback="" />
              <span class="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="p-6 bg-muted/30">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            <!-- Campo de filtro por descrição -->
            <div class="relative flex-1 sm:flex-initial">
              <input
                v-model="filtros.descricao"
                type="text"
                placeholder="Buscar por descrição..."
                class="w-full sm:w-64 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm placeholder:text-gray-400"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <!-- Campo de filtro por data início -->
            <div class="relative flex-1 sm:flex-initial">
              <input
                v-model="filtros.dataInicial"
                type="date"
                placeholder="De"
                class="w-full sm:w-40 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <!-- Campo de filtro por data fim -->
            <div class="relative flex-1 sm:flex-initial">
              <input
                v-model="filtros.dataFinal"
                type="date"
                placeholder="Até"
                class="w-full sm:w-40 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <!-- Filtro por Tipo (Entrada/Saída) -->
            <div class="relative flex-1 sm:flex-initial">
              <select
                v-model="filtros.tipo"
                class="w-full sm:w-40 px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </select>
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
            <!-- Botão Limpar Filtros -->
            <button
              @click="limparFiltros"
              :disabled="!filtros.descricao && !filtros.dataInicial && !filtros.dataFinal && !filtros.tipo"
              :class="[
                'flex items-center justify-center gap-2 px-3 py-2.5 font-medium rounded-xl transition-colors',
                filtros.descricao || filtros.dataInicial || filtros.dataFinal || filtros.tipo
                  ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
              ]"
              title="Limpar filtros"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span class="hidden sm:inline text-sm">Limpar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detalhamento de Entradas -->
    <div v-if="filtros.tipo !== 'saida' && entradas.length > 0" class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
      <div class="p-4 md:p-6 border-b border-border">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          Detalhamento de Receitas (Entradas)
        </h3>
      </div>
      <div class="p-4 md:p-6">
        <div v-if="entradas.length === 0" class="text-center py-8">
          <Icon icon="info-circle" :class-name="'w-12 h-12 text-muted-foreground/50 mx-auto mb-4'" fallback="" />
          <p class="text-muted-foreground">Nenhuma entrada registrada no período</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="entrada in entradas"
            :key="entrada.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gradient-to-br from-green-50/30 to-emerald-50/20 dark:from-green-950/10 dark:to-emerald-950/5 rounded-lg border border-green-200/30 dark:border-green-800/20 shadow-sm hover:shadow-md transition-shadow duration-200 gap-2"
          >
            <div class="flex-1">
              <p class="font-medium text-foreground text-sm">{{ entrada.descricao }}</p>
              <p class="text-xs text-muted-foreground">{{ formatarData(entrada.data) }}</p>
            </div>
            <div class="text-right">
              <p class="text-base font-bold text-green-600 dark:text-green-400">+ R$ {{ formatarValor(entrada.valor) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detalhamento de Saídas -->
    <div v-if="filtros.tipo !== 'entrada' && saidas.length > 0" class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
      <div class="p-4 md:p-6 border-b border-border">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          Detalhamento de Despesas (Saídas)
        </h3>
      </div>
      <div class="p-4 md:p-6">
        <div v-if="saidas.length === 0" class="text-center py-8">
          <Icon icon="info-circle" :class-name="'w-12 h-12 text-muted-foreground/50 mx-auto mb-4'" fallback="" />
          <p class="text-muted-foreground">Nenhuma saída registrada no período</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="saida in saidas"
            :key="saida.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gradient-to-br from-red-50/30 to-rose-50/20 dark:from-red-950/10 dark:to-rose-950/5 rounded-lg border border-red-200/30 dark:border-red-800/20 shadow-sm hover:shadow-md transition-shadow duration-200 gap-2"
          >
            <div class="flex-1">
              <p class="font-medium text-foreground text-sm">{{ saida.descricao }}</p>
              <p class="text-xs text-muted-foreground">{{ formatarData(saida.data) }}</p>
            </div>
            <div class="text-right">
              <p class="text-base font-bold text-red-600 dark:text-red-400">- R$ {{ formatarValor(saida.valor) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Composables
const { entradas: entradasDB, fetchEntradas } = useEntradas()
const { saidas: saidasDB, fetchSaidas } = useSaidas()

// Filtros
const filtros = ref({
  descricao: '',
  dataInicial: '',
  dataFinal: '',
  tipo: '' // 'entrada' ou 'saida' ou '' para ambos
})

// Entradas e saídas filtradas
const entradas = computed(() => {
  // Se tipo for 'saida', não mostrar entradas
  if (filtros.value.tipo === 'saida') return []
  
  let dados = entradasDB.value || []
  
  // Filtro por descrição
  if (filtros.value.descricao.trim()) {
    const busca = filtros.value.descricao.toLowerCase().trim()
    dados = dados.filter((e: any) => 
      e.descricao?.toLowerCase().includes(busca)
    )
  }
  
  // Filtro por intervalo de datas
  if (filtros.value.dataInicial || filtros.value.dataFinal) {
    dados = dados.filter((e: any) => {
      const dataEntrada = e.data.split('T')[0].split(' ')[0]
      
      if (filtros.value.dataInicial && dataEntrada < filtros.value.dataInicial) {
        return false
      }
      
      if (filtros.value.dataFinal && dataEntrada > filtros.value.dataFinal) {
        return false
      }
      
      return true
    })
  }
  
  return dados
})

const saidas = computed(() => {
  // Se tipo for 'entrada', não mostrar saídas
  if (filtros.value.tipo === 'entrada') return []
  
  let dados = saidasDB.value || []
  
  // Filtro por descrição
  if (filtros.value.descricao.trim()) {
    const busca = filtros.value.descricao.toLowerCase().trim()
    dados = dados.filter((s: any) => 
      s.descricao?.toLowerCase().includes(busca)
    )
  }
  
  // Filtro por intervalo de datas
  if (filtros.value.dataInicial || filtros.value.dataFinal) {
    dados = dados.filter((s: any) => {
      const dataSaida = s.data.split('T')[0].split(' ')[0]
      
      if (filtros.value.dataInicial && dataSaida < filtros.value.dataInicial) {
        return false
      }
      
      if (filtros.value.dataFinal && dataSaida > filtros.value.dataFinal) {
        return false
      }
      
      return true
    })
  }
  
  return dados
})

// Funções
const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatarData = (data: string) => {
  const [datePart] = data.split('T')[0].split(' ')
  const [ano, mes, dia] = datePart.split('-')
  return `${dia}/${mes}/${ano}`
}

const limparFiltros = () => {
  filtros.value.descricao = ''
  filtros.value.dataInicial = ''
  filtros.value.dataFinal = ''
  filtros.value.tipo = ''
}

const exportarPDF = async () => {
  try {
    // Importação dinâmica para evitar problemas com SSR
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Configurações de página A4
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Cabeçalho
    doc.setFontSize(18)
    doc.setTextColor(79, 70, 229) // primary color
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório Financeiro', margin, 20)

    // Data de geração
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    const dataGeracao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Gerado em: ${dataGeracao}`, margin, 27)

    // Filtros aplicados
    let yPosition = 35
    if (filtros.value.dataInicial || filtros.value.dataFinal || filtros.value.tipo || filtros.value.descricao) {
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      doc.setFont('helvetica', 'bold')
      doc.text('Filtros Aplicados:', margin, yPosition)
      yPosition += 5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      if (filtros.value.dataInicial || filtros.value.dataFinal) {
        const dataIni = filtros.value.dataInicial ? new Date(filtros.value.dataInicial + 'T00:00:00').toLocaleDateString('pt-BR') : '-'
        const dataFim = filtros.value.dataFinal ? new Date(filtros.value.dataFinal + 'T00:00:00').toLocaleDateString('pt-BR') : '-'
        doc.text(`Período: ${dataIni} até ${dataFim}`, margin + 5, yPosition)
        yPosition += 5
      }

      if (filtros.value.tipo) {
        const tipoTexto = filtros.value.tipo === 'entrada' ? 'Entradas' : 'Saídas'
        doc.text(`Tipo: ${tipoTexto}`, margin + 5, yPosition)
        yPosition += 5
      }

      if (filtros.value.descricao) {
        doc.text(`Busca: ${filtros.value.descricao}`, margin + 5, yPosition)
        yPosition += 5
      }

      yPosition += 5
    }

    // Tabela de Entradas
    if (filtros.value.tipo !== 'saida' && entradas.value.length > 0) {
      // Título da seção - sem símbolos especiais
      doc.setFillColor(34, 197, 94) // green
      doc.rect(margin, yPosition - 4, 5, 5, 'F') // Quadrado verde
      
      doc.setFontSize(12)
      doc.setTextColor(34, 197, 94)
      doc.setFont('helvetica', 'bold')
      doc.text('Receitas (Entradas)', margin + 8, yPosition)
      yPosition += 8

      const entradasData = entradas.value.map((e: any) => [
        e.descricao || '-',
        e.quantidade ? e.quantidade.toString() : '-',
        formatarData(e.data),
        `R$ ${formatarValor(e.valor)}`
      ])

      const totalEntradas = entradas.value.reduce((acc: number, e: any) => acc + (e.valor || 0), 0)

      autoTable(doc, {
        startY: yPosition,
        head: [['Descrição', 'Qtd', 'Data', 'Valor']],
        body: entradasData,
        foot: [['TOTAL', '', '', `R$ ${formatarValor(totalEntradas)}`]],
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'left'
        },
        footStyles: {
          fillColor: [220, 252, 231],
          textColor: [21, 128, 61],
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [60, 60, 60],
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: pageWidth - 2 * margin - 90, halign: 'left' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 38, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin + 5 },
        didDrawPage: (data: any) => {
          // Rodapé
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber
          doc.text(
            `Página ${pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          )
        }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15
    }

    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 80 && filtros.value.tipo !== 'entrada' && saidas.value.length > 0) {
      doc.addPage()
      yPosition = 25
    }

    // Tabela de Saídas
    if (filtros.value.tipo !== 'entrada' && saidas.value.length > 0) {
      // Título da seção - sem símbolos especiais
      doc.setFillColor(239, 68, 68) // red
      doc.rect(margin, yPosition - 4, 5, 5, 'F') // Quadrado vermelho
      
      doc.setFontSize(12)
      doc.setTextColor(239, 68, 68)
      doc.setFont('helvetica', 'bold')
      doc.text('Despesas (Saidas)', margin + 8, yPosition)
      yPosition += 8

      const saidasData = saidas.value.map((s: any) => [
        s.descricao || '-',
        s.quantidade ? s.quantidade.toString() : '-',
        formatarData(s.data),
        `R$ ${formatarValor(s.valor)}`
      ])

      const totalSaidas = saidas.value.reduce((acc: number, s: any) => acc + (s.valor || 0), 0)

      autoTable(doc, {
        startY: yPosition,
        head: [['Descrição', 'Qtd', 'Data', 'Valor']],
        body: saidasData,
        foot: [['TOTAL', '', '', `R$ ${formatarValor(totalSaidas)}`]],
        theme: 'striped',
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'left'
        },
        footStyles: {
          fillColor: [254, 226, 226],
          textColor: [185, 28, 28],
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [60, 60, 60],
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: pageWidth - 2 * margin - 90, halign: 'left' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 38, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin + 5 },
        didDrawPage: (data: any) => {
          // Rodapé
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber
          doc.text(
            `Página ${pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          )
        }
      })
    }

    // Salvar o PDF
    const nomeArquivo = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(nomeArquivo)

    console.log('PDF exportado com sucesso!')
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    alert('Erro ao gerar o arquivo PDF. Verifique se as bibliotecas estão carregadas.')
  }
}

const exportarExcel = async () => {
  try {
    // Importar biblioteca xlsx
    const XLSX = await import('xlsx')
    
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Preparar dados
    const dadosCompletos: any[][] = [
      ['Relatório Financeiro'],
      [`Gerado em: ${dataFormatada}`],
      []
    ]

    // Filtros aplicados
    if (filtros.value.dataInicial || filtros.value.dataFinal || filtros.value.tipo || filtros.value.descricao) {
      dadosCompletos.push(['Filtros Aplicados:'])
      
      if (filtros.value.dataInicial || filtros.value.dataFinal) {
        const dataIni = filtros.value.dataInicial ? new Date(filtros.value.dataInicial + 'T00:00:00').toLocaleDateString('pt-BR') : '-'
        const dataFim = filtros.value.dataFinal ? new Date(filtros.value.dataFinal + 'T00:00:00').toLocaleDateString('pt-BR') : '-'
        dadosCompletos.push([`Período: ${dataIni} até ${dataFim}`])
      }
      
      if (filtros.value.tipo) {
        const tipoTexto = filtros.value.tipo === 'entrada' ? 'Entradas' : 'Saídas'
        dadosCompletos.push([`Tipo: ${tipoTexto}`])
      }
      
      if (filtros.value.descricao) {
        dadosCompletos.push([`Busca: ${filtros.value.descricao}`])
      }
      
      dadosCompletos.push([])
    }

    // Entradas
    if (filtros.value.tipo !== 'saida' && entradas.value.length > 0) {
      dadosCompletos.push(['RECEITAS (ENTRADAS)'])
      dadosCompletos.push(['Descrição', 'Qtd', 'Data', 'Valor'])
      
      entradas.value.forEach((e: any) => {
        dadosCompletos.push([
          e.descricao || '-',
          e.quantidade || '-',
          formatarData(e.data),
          e.valor || 0
        ])
      })
      
      const totalEntradas = entradas.value.reduce((acc: number, e: any) => acc + (e.valor || 0), 0)
      dadosCompletos.push(['TOTAL', '', '', totalEntradas])
      dadosCompletos.push([])
    }

    // Saídas
    if (filtros.value.tipo !== 'entrada' && saidas.value.length > 0) {
      dadosCompletos.push(['DESPESAS (SAÍDAS)'])
      dadosCompletos.push(['Descrição', 'Qtd', 'Data', 'Valor'])
      
      saidas.value.forEach((s: any) => {
        dadosCompletos.push([
          s.descricao || '-',
          s.quantidade || '-',
          formatarData(s.data),
          s.valor || 0
        ])
      })
      
      const totalSaidas = saidas.value.reduce((acc: number, s: any) => acc + (s.valor || 0), 0)
      dadosCompletos.push(['TOTAL', '', '', totalSaidas])
    }

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(dadosCompletos)

    // Configurar largura das colunas
    worksheet['!cols'] = [
      { wch: 40 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 }
    ]

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Financeiro')

    // Salvar o arquivo
    const nomeArquivo = `relatorio_financeiro_${agora.toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nomeArquivo)

    console.log('Excel exportado com sucesso!')
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert('Erro ao gerar o arquivo Excel. Tente novamente.')
  }
}

// Carregar dados do banco
onMounted(async () => {
  await Promise.all([
    fetchEntradas(),
    fetchSaidas()
  ])
})
</script>
