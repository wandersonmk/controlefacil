<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click="fechar"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              💬 Comentários
            </h2>
            <button
              @click="fechar"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <Icon icon="close" class="w-5 h-5" />
            </button>
          </div>

          <!-- Conteúdo - Comentários -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Loading -->
            <div v-if="carregando" class="flex justify-center py-8">
              <AppLoading />
            </div>

            <!-- Lista de comentários -->
            <div v-else-if="comentarios.length > 0" class="space-y-3">
              <div
                v-for="comentario in comentarios"
                :key="comentario.id"
                class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <!-- Info do autor -->
                    <div class="flex items-center gap-2 mb-1">
                      <img
                        v-if="comentario.usuario_avatar"
                        :src="comentario.usuario_avatar"
                        :alt="comentario.usuario_nome"
                        class="w-6 h-6 rounded-full object-cover"
                      />
                      <div v-else class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      
                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ comentario.usuario_nome }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        de {{ comentario.empresa_nome }}
                      </span>
                    </div>

                    <!-- Tempo -->
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {{ formatarTempo(comentario.criado_em) }}
                    </div>

                    <!-- Texto -->
                    <p class="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {{ comentario.texto }}
                    </p>
                  </div>

                  <!-- Botão deletar -->
                  <button
                    v-if="user?.id === comentario.usuario_id"
                    @click="excluir(comentario.id)"
                    :disabled="carregando"
                    class="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition text-xs"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <!-- Sem comentários -->
            <div v-else class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            </div>
          </div>

          <!-- Separador -->
          <div class="border-t dark:border-gray-700"></div>

          <!-- Form de novo comentário -->
          <div class="p-4 space-y-3">
            <textarea
              v-model="novoComentario"
              placeholder="Escreva seu comentário..."
              rows="3"
              class="w-full p-3 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>

            <!-- Contador de caracteres -->
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ novoComentario.length }} / 500 caracteres
              </span>

              <!-- Botões -->
              <div class="flex gap-2">
                <button
                  @click="fechar"
                  class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  @click="enviar"
                  :disabled="!novoComentario.trim() || carregando"
                  class="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition"
                >
                  {{ carregando ? 'Enviando...' : 'Comentar' }}
                </button>
              </div>
            </div>

            <!-- Erro -->
            <div v-if="erro" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg">
              {{ erro }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useComentarios, type Comentario } from '@/composables/useComentarios'
import { useAuth } from '@/composables/useAuth'
import { formatarTempoRelativo } from '@/utils/formatarTempo'

interface Props {
  sugestaoId: string
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'comentario-added'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { comentarios, carregando, erro, fetchComentarios, criarComentario, deletarComentario } = useComentarios()
const { user } = useAuth()

const novoComentario = ref('')

const formatarTempo = (data: string) => {
  return formatarTempoRelativo(new Date(data))
}

const fechar = () => {
  novoComentario.value = ''
  emit('close')
}

const enviar = async () => {
  if (!novoComentario.value.trim()) return

  try {
    await criarComentario(props.sugestaoId, novoComentario.value)
    novoComentario.value = ''
    emit('comentario-added')
  } catch (err) {
    console.error('Erro ao criar comentário:', err)
  }
}

const excluir = async (comentarioId: string) => {
  if (!confirm('Tem certeza que deseja deletar este comentário?')) return

  try {
    await deletarComentario(comentarioId, props.sugestaoId)
    emit('comentario-added')
  } catch (err) {
    console.error('Erro ao deletar comentário:', err)
  }
}

// Carregar comentários quando o modal abrir
const watcher = computed(() => props.isOpen)
watch(watcher, async (novoValor) => {
  if (novoValor) {
    try {
      await fetchComentarios(props.sugestaoId)
    } catch (err) {
      console.error('Erro ao carregar comentários:', err)
    }
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
