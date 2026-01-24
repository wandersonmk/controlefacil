<template>
  <div class="space-y-2">
    <!-- Filtros e Ordenação -->
    <div class="flex flex-col sm:flex-row gap-2 mb-4">
      <!-- Ordenação -->
      <div class="flex-1">
        <select
          v-model="ordenacao"
          class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="recente">Mais Recentes</option>
          <option value="populares">Mais Populares</option>
          <option value="curtidas">Mais Curtidas</option>
        </select>
      </div>

      <!-- Filtro de Categoria -->
      <div class="flex-1">
        <select
          v-model="filtroCategoria"
          class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas as Categorias</option>
          <option value="interface">🎨 Interface</option>
          <option value="funcionalidade">⚡ Funcionalidade</option>
          <option value="performance">🚀 Performance</option>
          <option value="integracao">🔗 Integração</option>
          <option value="outro">💡 Outro</option>
        </select>
      </div>

      <!-- Busca -->
      <div class="flex-1">
        <input
          v-model="busca"
          type="text"
          placeholder="Buscar sugestões..."
          class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>

    <!-- Lista de Sugestões -->
    <div v-if="sugestoesFiltradas.length > 0" class="space-y-2">
      <SugestaoCard
        v-for="sugestao in sugestoesFiltradas"
        :key="sugestao.id"
        :sugestao="sugestao"
        @curtir="handleCurtir(sugestao.id)"
        @descurtir="handleDescurtir(sugestao.id)"
        @showDetails="handleShowDetails(sugestao.id)"
      />
    </div>

    <!-- Estado Vazio -->
    <div v-else class="text-center py-8 border border-dashed border-border rounded-lg">
      <p class="text-muted-foreground text-sm">
        Nenhuma sugestão encontrada. Seja o primeiro a compartilhar uma ideia! 💡
      </p>
    </div>

    <!-- Paginação (futuro) -->
    <div v-if="sugestoesFiltradas.length > 10" class="flex justify-center gap-2 mt-4 pt-4 border-t border-border">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="paginaAtual = page"
        :class="[
          'px-2 py-1 text-xs font-medium rounded transition-colors',
          paginaAtual === page
            ? 'bg-primary text-primary-foreground'
            : 'border border-border hover:bg-muted'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SugestaoCard from './SugestaoCard.vue'

interface Sugestao {
  id: string
  titulo: string
  descricao: string
  categoria: string
  empresa_nome: string
  empresa_id: string
  usuario_id: string
  data_criacao: string
  curtidas: number
  comentarios: number
  ja_curtiu?: boolean
}

const props = defineProps<{
  sugestoes: Sugestao[]
}>()

const emit = defineEmits<{
  curtir: [id: string]
  descurtir: [id: string]
  showDetails: [id: string]
}>()

const ordenacao = ref('recente')
const filtroCategoria = ref('')
const busca = ref('')
const paginaAtual = ref(1)

const sugestoesFiltradas = computed(() => {
  let filtradas = [...props.sugestoes]

  // Filtro por categoria
  if (filtroCategoria.value) {
    filtradas = filtradas.filter(s => s.categoria === filtroCategoria.value)
  }

  // Busca por texto
  if (busca.value) {
    const searchLower = busca.value.toLowerCase()
    filtradas = filtradas.filter(s =>
      s.titulo.toLowerCase().includes(searchLower) ||
      s.descricao.toLowerCase().includes(searchLower)
    )
  }

  // Ordenação
  if (ordenacao.value === 'curtidas') {
    filtradas.sort((a, b) => b.curtidas - a.curtidas)
  } else if (ordenacao.value === 'populares') {
    filtradas.sort((a, b) => (b.curtidas + b.comentarios) - (a.curtidas + a.comentarios))
  } else {
    // recente
    filtradas.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
  }

  return filtradas
})

const totalPages = computed(() => {
  return Math.ceil(sugestoesFiltradas.value.length / 10)
})

const handleCurtir = (id: string) => {
  emit('curtir', id)
}

const handleDescurtir = (id: string) => {
  emit('descurtir', id)
}

const handleShowDetails = (id: string) => {
  emit('showDetails', id)
}
</script>
