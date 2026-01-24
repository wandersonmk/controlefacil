<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
  pageTitle: 'Sugestões & Melhorias',
  pageDescription: 'Compartilhe ideias e melhore a plataforma'
})

import { ref, onMounted, computed } from 'vue'
import SugestoesForm from '~/components/SugestoesForm.vue'
import SugestoesList from '~/components/SugestoesList.vue'

const sugestoes = ref<any[]>([])
const isLoading = ref(true)
const erro = ref<string | null>(null)
const sugestoesComposable = ref<any>(null)

// Computed para verificar se sugestões está pronta
const sugestoesCarregadas = computed(() => {
  return Array.isArray(sugestoes.value) && sugestoes.value.length > 0
})

onMounted(async () => {
  try {
    // Importar e usar o composable apenas no cliente
    const { useSugestoes } = await import('~/composables/useSugestoes')
    const composable = useSugestoes()
    sugestoesComposable.value = composable
    
    console.log('[sugestoes.vue] Composable inicializado:', composable)
    
    await composable.fetchSugestoes()
    
    // Verificação segura
    if (composable.sugestoes && composable.sugestoes.value && Array.isArray(composable.sugestoes.value)) {
      sugestoes.value = composable.sugestoes.value
    }
    
    if (composable.isLoading && composable.isLoading.value !== undefined) {
      isLoading.value = composable.isLoading.value
    } else {
      isLoading.value = false
    }
    
    console.log('[sugestoes.vue] Sugestões carregadas:', sugestoes.value.length)
  } catch (err) {
    console.error('[sugestoes.vue] Erro ao inicializar composable:', err)
    erro.value = 'Erro ao carregar sugestões'
    isLoading.value = false
  }
})

const handleCurtir = (id: string) => {
  try {
    if (sugestoesComposable.value) {
      sugestoesComposable.value.curtirSugestao(id)
    }
  } catch (err) {
    console.error('[sugestoes.vue] Erro ao curtir:', err)
  }
}

const handleDescurtir = (id: string) => {
  try {
    if (sugestoesComposable.value) {
      sugestoesComposable.value.descurtirSugestao(id)
    }
  } catch (err) {
    console.error('[sugestoes.vue] Erro ao descurtir:', err)
  }
}

const handleShowDetails = (id: string) => {
  console.log('Mostrar detalhes da sugestão:', id)
}

const handleComentarioAdded = async () => {
  // Recarregar sugestões quando um comentário é adicionado
  try {
    if (sugestoesComposable.value) {
      console.log('[sugestoes.vue] Recarregando sugestões após comentário...')
      await sugestoesComposable.value.fetchSugestoes()
      
      if (sugestoesComposable.value.sugestoes && typeof sugestoesComposable.value.sugestoes === 'object' && 'value' in sugestoesComposable.value.sugestoes) {
        const novaLista = sugestoesComposable.value.sugestoes.value
        if (Array.isArray(novaLista)) {
          sugestoes.value = novaLista
          console.log('[sugestoes.vue] Sugestões recarregadas após comentário')
        }
      }
    }
  } catch (err) {
    console.error('[sugestoes.vue] Erro ao recarregar sugestões:', err)
  }
}

const handleSubmitSugestao = async (data: any) => {
  try {
    if (!sugestoesComposable.value) {
      console.error('[sugestoes.vue] Composable não inicializado')
      return
    }

    console.log('[sugestoes.vue] Enviando sugestão:', data)
    const result = await sugestoesComposable.value.criarSugestao(data.titulo, data.descricao, data.categoria)
    
    if (result) {
      console.log('[sugestoes.vue] Sugestão criada com sucesso, aguardando atualização...')
      // Aguardar um pouco e depois tentar refazer o fetch
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        // Refazer fetch
        await sugestoesComposable.value.fetchSugestoes()
        console.log('[sugestoes.vue] Fetch realizado, tentando atualizar lista local...')
        
        // Acessar com segurança
        if (sugestoesComposable.value.sugestoes && typeof sugestoesComposable.value.sugestoes === 'object' && 'value' in sugestoesComposable.value.sugestoes) {
          const novaLista = sugestoesComposable.value.sugestoes.value
          if (Array.isArray(novaLista)) {
            sugestoes.value = novaLista
            console.log('[sugestoes.vue] Lista atualizada com sucesso, total:', sugestoes.value.length)
          } else {
            console.error('[sugestoes.vue] Sugestões não é um array:', novaLista)
          }
        } else {
          console.error('[sugestoes.vue] Propriedade sugestoes não acessível:', sugestoesComposable.value.sugestoes)
        }
      } catch (fetchErr) {
        console.error('[sugestoes.vue] Erro ao refazer fetch:', fetchErr)
      }
    } else {
      const errorMsg = sugestoesComposable.value.error?.value || 'Erro ao criar sugestão'
      console.error('[sugestoes.vue] Erro ao criar sugestão:', errorMsg)
    }
  } catch (err) {
    console.error('[sugestoes.vue] Erro não tratado:', err)
  }
}
</script>

<template>
  <ClientOnly>
    <!-- Erro ao carregar -->
    <div v-if="erro" class="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        {{ erro }}
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div v-else class="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- Coluna Esquerda: Formulário (sticky) -->
        <div class="md:col-span-1 lg:col-span-1">
          <div class="md:sticky md:top-24">
            <!-- Formulário -->
            <div class="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-sm">
              <SugestoesForm @submitted="handleSubmitSugestao" />
            </div>
          </div>
        </div>

        <!-- Coluna Direita: Lista de Sugestões -->
        <div class="md:col-span-1 lg:col-span-3">
          <!-- Loading State -->
          <div v-if="isLoading" class="space-y-3">
            <div
              v-for="i in 3"
              :key="`loading-${i}`"
              class="bg-muted rounded-lg h-32 animate-pulse"
            />
          </div>
          
          <!-- Conteúdo carregado -->
          <div v-else-if="sugestoes.length > 0">
            <SugestoesList
              :sugestoes="sugestoes"
              @curtir="handleCurtir"
              @descurtir="handleDescurtir"
              @showDetails="handleShowDetails"
              @comentario-added="handleComentarioAdded"
            />
          </div>
          
          <!-- Sem sugestões -->
          <div v-else class="text-center py-8 border border-dashed border-border rounded-lg">
            <p class="text-muted-foreground">Nenhuma sugestão ainda. Seja o primeiro a sugerir! 💡</p>
          </div>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="min-h-screen bg-background flex items-center justify-center">
        <p class="text-muted-foreground">Carregando sugestões...</p>
      </div>
    </template>
  </ClientOnly>
</template>
