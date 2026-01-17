<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Entrada } from '../../shared/types/entradas.types'

const props = defineProps<{
  entrada?: Entrada | null
}>()

const emit = defineEmits<{
  salvar: [dados: any]
  cancelar: []
}>()

// Form data
const descricao = ref('')
const valor = ref('')
const valorFormatado = ref('')
const data = ref(new Date().toISOString().split('T')[0])
const categoria = ref('Vendas')
const formaRecebimento = ref<'Pix' | 'Cartão' | 'Dinheiro' | 'Transferência' | 'Outro'>('Pix')
const status = ref<'Confirmada' | 'Pendente'>('Confirmada')
const observacoes = ref('')

// Opções
const formasPagamento = ['Pix', 'Dinheiro', 'Cartão', 'Transferência', 'Outro']
const categorias = ['Vendas', 'Serviços', 'Outros Recebimentos']
const statusOpcoes = ['Confirmada', 'Pendente']

// Preencher formulário se estiver editando
watch(() => props.entrada, (nova) => {
  if (nova) {
    descricao.value = nova.descricao
    valor.value = nova.valor.toString()
    valorFormatado.value = formatarMoeda(nova.valor.toString())
    data.value = nova.data.split('T')[0]
    categoria.value = nova.categoria
    formaRecebimento.value = nova.formaRecebimento
    status.value = nova.status
    observacoes.value = nova.observacoes || ''
  } else {
    // Limpar
    descricao.value = ''
    valor.value = ''
    valorFormatado.value = ''
    data.value = new Date().toISOString().split('T')[0]
    categoria.value = 'Vendas'
    formaRecebimento.value = 'Pix'
    status.value = 'Confirmada'
    observacoes.value = ''
  }
}, { immediate: true })

// Formatar valor como moeda brasileira
const formatarMoeda = (value: string) => {
  const numero = parseFloat(value.replace(/\D/g, '')) / 100
  if (isNaN(numero)) return ''
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Atualizar valor enquanto digita
const handleValorInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const apenasNumeros = input.value.replace(/\D/g, '')
  
  if (apenasNumeros) {
    const numero = parseFloat(apenasNumeros) / 100
    valor.value = numero.toFixed(2)
    valorFormatado.value = formatarMoeda(apenasNumeros)
  } else {
    valor.value = ''
    valorFormatado.value = ''
  }
}

// Salvar
const handleSubmit = () => {
  if (!descricao.value || !valor.value || !data.value) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  const dados = {
    descricao: descricao.value,
    valor: parseFloat(valor.value),
    data: new Date(data.value).toISOString(),
    categoria: categoria.value,
    forma_recebimento: formaRecebimento.value,
    status: status.value,
    observacoes: observacoes.value || undefined
  }

  emit('salvar', dados)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="p-4 space-y-3">
    <!-- Descrição -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Descrição <span class="text-red-500">*</span>
      </label>
      <AppInput
        v-model="descricao"
        placeholder="Ex: Venda de açaí"
        required
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Valor -->
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Valor <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
            R$
          </span>
          <input
            :value="valorFormatado"
            @input="handleValorInput"
            type="text"
            placeholder="0,00"
            class="w-full pl-12 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            required
          />
        </div>
      </div>

      <!-- Data -->
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Data <span class="text-red-500">*</span>
        </label>
        <AppInput
          v-model="data"
          type="date"
          required
        />
      </div>
    </div>

    <!-- Forma de Recebimento -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Forma de Recebimento <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
        <button
          v-for="forma in formasPagamento"
          :key="forma"
          type="button"
          @click="formaRecebimento = forma as any"
          :class="[
            'px-3 py-2 rounded-lg border-2 transition-all font-medium text-xs',
            formaRecebimento === forma
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500/50'
          ]"
        >
          {{ forma }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Categoria -->
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Categoria
        </label>
        <select
          v-model="categoria"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option v-for="cat in categorias" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Status
        </label>
        <select
          v-model="status"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option v-for="st in statusOpcoes" :key="st" :value="st">
            {{ st }}
          </option>
        </select>
      </div>
    </div>

    <!-- Observações -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Observações
      </label>
      <textarea
        v-model="observacoes"
        rows="2"
        placeholder="Informações adicionais..."
        class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
      ></textarea>
    </div>

    <!-- Botões -->
    <div class="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
      <AppButton type="button" @click="emit('cancelar')" class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm">
        Cancelar
      </AppButton>
      <AppButton type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm">
        {{ entrada ? 'Salvar Alterações' : 'Criar Entrada' }}
      </AppButton>
    </div>
  </form>
</template>
