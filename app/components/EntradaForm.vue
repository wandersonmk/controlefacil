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
    data.value = nova.data.split('T')[0]
    categoria.value = nova.categoria
    formaRecebimento.value = nova.formaRecebimento
    status.value = nova.status
    observacoes.value = nova.observacoes || ''
  } else {
    // Limpar
    descricao.value = ''
    valor.value = ''
    data.value = new Date().toISOString().split('T')[0]
    categoria.value = 'Vendas'
    formaRecebimento.value = 'Pix'
    status.value = 'Confirmada'
    observacoes.value = ''
  }
}, { immediate: true })

// Formatar valor enquanto digita
const formatarValorInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  
  if (value) {
    const numero = parseInt(value) / 100
    valor.value = numero.toFixed(2)
  } else {
    valor.value = ''
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
    formaRecebimento: formaRecebimento.value,
    status: status.value,
    observacoes: observacoes.value || undefined
  }

  emit('salvar', dados)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
    <!-- Descrição -->
    <div>
      <label class="block text-sm font-medium text-foreground mb-2">
        Descrição <span class="text-red-500">*</span>
      </label>
      <AppInput
        v-model="descricao"
        placeholder="Ex: Venda de açaí"
        required
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Valor -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          Valor <span class="text-red-500">*</span>
        </label>
        <AppInput
          v-model="valor"
          type="number"
          step="0.01"
          placeholder="0,00"
          required
        />
      </div>

      <!-- Data -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
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
      <label class="block text-sm font-medium text-foreground mb-2">
        Forma de Recebimento <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
        <button
          v-for="forma in formasPagamento"
          :key="forma"
          type="button"
          @click="formaRecebimento = forma as any"
          :class="[
            'px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm',
            formaRecebimento === forma
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/50'
          ]"
        >
          {{ forma }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Categoria -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          Categoria
        </label>
        <select
          v-model="categoria"
          class="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option v-for="cat in categorias" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          Status
        </label>
        <select
          v-model="status"
          class="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option v-for="st in statusOpcoes" :key="st" :value="st">
            {{ st }}
          </option>
        </select>
      </div>
    </div>

    <!-- Observações -->
    <div>
      <label class="block text-sm font-medium text-foreground mb-2">
        Observações
      </label>
      <textarea
        v-model="observacoes"
        rows="3"
        placeholder="Informações adicionais..."
        class="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      ></textarea>
    </div>

    <!-- Botões -->
    <div class="flex gap-3 pt-4">
      <AppButton type="button" @click="emit('cancelar')" class="flex-1 bg-muted text-foreground hover:bg-muted/80">
        Cancelar
      </AppButton>
      <AppButton type="submit" class="flex-1">
        {{ entrada ? 'Salvar Alterações' : 'Criar Entrada' }}
      </AppButton>
    </div>
  </form>
</template>
