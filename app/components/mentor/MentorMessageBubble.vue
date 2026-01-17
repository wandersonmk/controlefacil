<script setup lang="ts">
import { marked } from 'marked'

interface Props {
  tipo: 'usuario' | 'mentor'
  mensagem: string
  hora?: string
}

const props = defineProps<Props>()

const copiarTexto = async () => {
  try {
    if (!process.client || !navigator?.clipboard?.writeText) {
      throw new Error('clipboard_unavailable')
    }

    await navigator.clipboard.writeText(props.mensagem)
    const toast = await useToastSafe()
    toast?.success?.('Mensagem copiada ✅')
  } catch {
    const toast = await useToastSafe()
    toast?.error?.('Não foi possível copiar a mensagem')
  }
}

// Renderizar markdown para mensagens do mentor
const mensagemRenderizada = computed(() => {
  if (props.tipo === 'mentor') {
    return marked(props.mensagem, {
      breaks: true,
      gfm: true
    })
  }
  return props.mensagem
})
</script>

<template>
  <div 
    class="flex mb-4 md:mb-5"
    :class="tipo === 'usuario' ? 'justify-end' : 'justify-start'"
  >
    <div 
      class="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3.5 md:px-5 md:py-4 shadow-sm"
      :class="tipo === 'usuario' 
        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
        : 'bg-card border border-border'"
    >
      <!-- Avatar do Mentor -->
      <div v-if="tipo === 'mentor'" class="flex items-start gap-2 md:gap-3 mb-2.5 md:mb-3">
        <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
          <span>&#129302;</span>
        </div>
        <div class="flex-1">
          <p class="text-xs md:text-sm font-semibold text-muted-foreground">Mentor IA</p>
        </div>
      </div>

      <!-- Mensagem -->
      <div 
        v-if="tipo === 'mentor'"
        class="text-sm md:text-base leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-1 prose-li:my-0"
        v-html="mensagemRenderizada"
      />
      <div v-else class="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
        {{ mensagem }}
      </div>

      <!-- Rodapé -->
      <div class="flex items-center justify-between mt-2.5 md:mt-3 gap-2">
        <span class="text-xs opacity-70">{{ hora || 'Agora' }}</span>
        
        <!-- Botão Copiar (apenas para mensagens do mentor) -->
        <button
          v-if="tipo === 'mentor'"
          @click="copiarTexto"
          class="text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors inline-flex items-center gap-1 md:gap-2"
          title="Copiar mensagem"
        >
          <Icon icon="copy" class-name="w-3.5 h-3.5" fallback="📋" />
          <span class="hidden md:inline">Copiar</span>
        </button>
      </div>
    </div>
  </div>
</template>
