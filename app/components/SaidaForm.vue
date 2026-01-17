<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  saida?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['salvar', 'cancelar'])

const categorias = [
  'Aluguel',
  'Água',
  'Energia',
  'Telefone/Internet',
  'Fornecedores',
  'Pagamento Funcionário',
  'Vale Funcionário',
  'Impostos',
  'Manutenção',
  'Outros'
]

const formasPagamento = ['Dinheiro', 'PIX', 'Cartão', 'Transferência', 'Boleto']
const statusOpcoes = ['Paga', 'Pendente', 'Vencida']

// Form data
const form = ref({
  descricao: '',
  valor: 0,
  data: new Date().toISOString().split('T')[0],
  categoria: 'Outros',
  formaPagamento: 'Dinheiro',
  status: 'Pendente',
  funcionario: '',
  observacoes: ''
})

// Mostrar campo funcionário apenas para categoria "Vale Funcionário"
const mostrarCampoFuncionario = computed(() => {
  return form.value.categoria === 'Vale Funcionário'
})

// Preencher form ao editar
watch(
  () => props.saida,
  (saida) => {
    if (saida) {
      form.value = {
        descricao: saida.descricao || '',
        valor: saida.valor || 0,
        data: saida.data ? new Date(saida.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        categoria: saida.categoria || 'Outros',
        formaPagamento: saida.formaPagamento || 'Dinheiro',
        status: saida.status || 'Pendente',
        funcionario: saida.funcionario || '',
        observacoes: saida.observacoes || ''
      }
    }
  },
  { immediate: true }
)

// Validação
const validar = () => {
  if (!form.value.descricao.trim()) {
    alert('Descrição é obrigatória')
    return false
  }
  if (form.value.valor <= 0) {
    alert('Valor deve ser maior que zero')
    return false
  }
  if (!form.value.data) {
    alert('Data é obrigatória')
    return false
  }
  if (mostrarCampoFuncionario.value && !form.value.funcionario.trim()) {
    alert('Nome do funcionário é obrigatório para vales')
    return false
  }
  return true
}

const salvar = () => {
  if (!validar()) return

  const dados = {
    ...form.value,
    valor: Number(form.value.valor),
    data: new Date(form.value.data).toISOString()
  }

  // Remover campo funcionario se não for Vale
  if (!mostrarCampoFuncionario.value) {
    delete dados.funcionario
  }

  emit('salvar', dados)
}

const cancelar = () => {
  emit('cancelar')
}
</script>

<template>
  <form @submit.prevent="salvar" class="p-4 space-y-3">
    <!-- Descrição -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Descrição <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.descricao"
        type="text"
        placeholder="Ex: Aluguel do mês, Conta de luz..."
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400"
        required
      />
    </div>

    <!-- Valor e Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Valor (R$) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.valor"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Data <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.data"
          type="date"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-gray-100"
          required
        />
      </div>
    </div>

    <!-- Categoria -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Categoria <span class="text-red-500">*</span>
      </label>
      <select
        v-model="form.categoria"
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-gray-100"
        required
      >
        <option v-for="cat in categorias" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <!-- Campo Funcionário (apenas para Vale) -->
    <div v-if="mostrarCampoFuncionario">
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Nome do Funcionário <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.funcionario"
        type="text"
        placeholder="Ex: João Silva"
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400"
        :required="mostrarCampoFuncionario"
      />
    </div>

    <!-- Forma de Pagamento e Status -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Forma de Pagamento
        </label>
        <select
          v-model="form.formaPagamento"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-gray-100"
        >
          <option v-for="fp in formasPagamento" :key="fp" :value="fp">
            {{ fp }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Status
        </label>
        <select
          v-model="form.status"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-gray-100"
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
        v-model="form.observacoes"
        rows="2"
        placeholder="Informações adicionais (opcional)"
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400"
      />
    </div>

    <!-- Botões -->
    <div class="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        @click="cancelar"
        class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors text-sm"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl text-sm"
      >
        {{ saida ? 'Salvar Alterações' : 'Registrar Saída' }}
      </button>
    </div>
  </form>
</template>
