<script setup lang="ts">
import type { AdminCliente } from '~/composables/useAdminClientes'

interface Props {
  show: boolean
  cliente: AdminCliente | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'confirm': [dados: { nome: string, email: string, whatsapp: string | null }]
}>()

const form = ref({
  nome: '',
  email: '',
  whatsapp: ''
})

watch(() => props.cliente, (cliente) => {
  if (cliente) {
    form.value = {
      nome: cliente.nome,
      email: cliente.email,
      whatsapp: cliente.whatsapp || ''
    }
  }
}, { immediate: true })

const handleConfirm = () => {
  if (form.value.nome && form.value.email) {
    emit('confirm', {
      nome: form.value.nome,
      email: form.value.email,
      whatsapp: form.value.whatsapp || null
    })
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div class="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Icon icon="edit" class-name="w-6 h-6 text-blue-500" fallback="✏️" />
          </div>
          <h3 class="text-lg font-semibold text-foreground">Editar Cliente</h3>
        </div>
        <button
          @click="handleClose"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon icon="times" class-name="w-5 h-5" fallback="✕" />
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            Nome da Empresa
          </label>
          <input
            v-model="form.nome"
            type="text"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nome da empresa"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            WhatsApp
          </label>
          <input
            v-model="form.whatsapp"
            type="text"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="(88) 99999-9999"
          />
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="handleClose"
          class="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirm"
          :disabled="!form.nome || !form.email"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  </div>
</template>
