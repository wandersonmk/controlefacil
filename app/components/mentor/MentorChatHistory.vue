<script setup lang="ts">
const { conversations, conversationId, fetchConversations, selectConversation, startNewConversation, deleteConversation, isLoading } = useMentor()

const showDeleteModal = ref(false)
const deleting = ref(false)
const conversaParaExcluir = ref<{ id: string; title: string } | null>(null)

// Buscar conversas ao montar (apenas no cliente)
onMounted(() => {
  if (process.client) {
    fetchConversations()
  }
})

const handleSelectConversation = async (id: string) => {
  await selectConversation(id)
}

const handleNewConversation = async () => {
  startNewConversation()

  const toast = await useToastSafe()
  toast?.success?.('Nova conversa iniciada ✅')
}

const openDeleteModal = (id: string, title: string) => {
  conversaParaExcluir.value = { id, title }
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  if (deleting.value) return
  showDeleteModal.value = false
  conversaParaExcluir.value = null
}

const forceCloseDeleteModal = () => {
  showDeleteModal.value = false
  conversaParaExcluir.value = null
}

const confirmDeleteConversation = async () => {
  if (!conversaParaExcluir.value || deleting.value) return

  try {
    deleting.value = true
    await deleteConversation(conversaParaExcluir.value.id)
    const toast = await useToastSafe()
    toast?.success?.('Conversa apagada ✅')
    forceCloseDeleteModal()
  } catch (e) {
    const toast = await useToastSafe()
    toast?.error?.('Não foi possível apagar a conversa')
  } finally {
    deleting.value = false
  }
}

// Formatar data
const formatarData = (dataStr: string) => {
  const data = new Date(dataStr)
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)

  if (data.toDateString() === hoje.toDateString()) {
    return 'Hoje, ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } else if (data.toDateString() === ontem.toDateString()) {
    return 'Ontem, ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } else {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ', ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
}
</script>

<template>
  <div class="h-full bg-card border border-border rounded-xl p-4 flex flex-col">
    <!-- Modal Confirmar Exclusão -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeDeleteModal"
    >
      <div class="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border overflow-hidden">
        <div class="p-5">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
              <Icon icon="trash-alt" class-name="w-5 h-5" fallback="" />
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold text-foreground">Excluir conversa?</h3>
              <p class="text-xs text-muted-foreground mt-1">Essa ação não pode ser desfeita.</p>
            </div>
          </div>

          <div class="mt-4 p-3 rounded-xl bg-muted/30 border border-border/50">
            <p class="text-xs text-muted-foreground mb-1">Conversa</p>
            <p class="text-sm font-semibold text-foreground truncate">
              {{ conversaParaExcluir?.title }}
            </p>
          </div>

          <div class="mt-5 flex gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/70 text-foreground rounded-xl transition-colors text-xs font-medium"
              :disabled="deleting"
              @click="closeDeleteModal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="deleting"
              @click="confirmDeleteConversation"
            >
              <span v-if="deleting" class="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              <span v-else>
                <Icon icon="trash-alt" class-name="w-4 h-4" fallback="" />
              </span>
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botão Nova Conversa -->
    <button 
      @click="handleNewConversation"
      class="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
    >
      <span class="text-xl">+</span>
      <span>Nova Conversa</span>
    </button>

    <!-- Título da Seção -->
    <div class="mb-3">
      <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Conversas Recentes</h3>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && conversations.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-sm text-muted-foreground">Carregando...</div>
    </div>

    <!-- Lista de Conversas -->
    <div v-else-if="conversations.length > 0" class="flex-1 overflow-y-auto space-y-2">
      <div
        v-for="conversa in conversations"
        :key="conversa.id"
        class="group w-full p-3 rounded-lg transition-all border flex items-start gap-2"
        :class="conversationId === conversa.id 
          ? 'bg-primary/10 border-primary dark:bg-primary/20' 
          : 'bg-muted/30 border-transparent hover:bg-muted/50'"
      >
        <button
          @click="handleSelectConversation(conversa.id)"
          class="flex items-start gap-2 flex-1 min-w-0 text-left"
        >
          <span class="text-lg flex-shrink-0">💬</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate" :class="conversationId === conversa.id ? 'text-primary' : 'text-foreground'">
              {{ conversa.title }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ formatarData(conversa.updated_at) }}</p>
          </div>
        </button>

        <button
          class="ml-2 flex-shrink-0 w-5 h-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
          title="Apagar conversa"
          @click.stop="openDeleteModal(conversa.id, conversa.title)"
        >
          <Icon icon="trash-alt" class-name="text-[11px]" fallback="" />
        </button>
      </div>
    </div>

    <!-- Vazio -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center text-sm text-muted-foreground">
        <p>Nenhuma conversa ainda</p>
        <p class="mt-1">Clique em "Nova Conversa"</p>
      </div>
    </div>
  </div>
</template>
