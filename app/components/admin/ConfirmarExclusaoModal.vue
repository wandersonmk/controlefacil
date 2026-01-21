<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-card rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="p-6 border-b border-border">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-foreground">Confirmar Exclusão</h3>
            <p class="text-sm text-muted-foreground mt-1">Esta ação não pode ser desfeita</p>
          </div>
        </div>
      </div>

      <!-- Conteúdo -->
      <div class="p-6">
        <p class="text-foreground">
          Tem certeza que deseja excluir o fornecedor <span class="font-semibold">"{{ itemNome }}"</span>?
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          Este fornecedor será removido permanentemente da lista de fornecedores parceiros.
        </p>
      </div>

      <!-- Botões -->
      <div class="flex justify-end space-x-3 p-6 border-t border-border bg-muted/30">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          <span>Excluir</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  itemNome: string
}>()

defineEmits<{
  close: []
  confirm: []
}>()
</script>
