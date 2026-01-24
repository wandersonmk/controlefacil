<template>
  <div class="min-h-screen bg-background">
    <!-- Header com Botão de Voltar -->
    <div class="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <!-- Botão Voltar Destacado -->
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-4 py-2 mb-3 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          <span class="text-lg">←</span>
          <span>Voltar ao Dashboard</span>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
            💡
          </div>
          <h1 class="text-2xl font-bold text-foreground">Sugestões & Melhorias</h1>
        </div>
        <p class="text-sm text-muted-foreground mt-2">
          Compartilhe suas ideias e veja o que outros usuários estão sugerindo para melhorar a plataforma
        </p>
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Coluna Esquerda: Formulário (sticky em desktop) -->
        <div class="lg:col-span-1">
          <div class="lg:sticky lg:top-20">
            <SugestoesForm />

            <!-- Card de Info -->
            <div class="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-3">
              <h4 class="text-xs font-semibold text-foreground mb-2">💭 Dica</h4>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Ideias com mais curtidas ganham prioridade! Compartilhe sua sugestão e engaje com a comunidade votando nas ideias que você ama.
              </p>
            </div>

            <!-- Card de Comunidade -->
            <div class="mt-3 bg-secondary/10 border border-secondary/20 rounded-lg p-3">
              <h4 class="text-xs font-semibold text-foreground mb-2">👥 Comunidade</h4>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Essa seção é compartilhada com todas as empresas que usam a plataforma. Suas sugestões ajudam a melhorar a experiência de todos!
              </p>
            </div>
          </div>
        </div>

        <!-- Coluna Direita: Lista de Sugestões -->
        <div class="lg:col-span-2">
          <div v-if="isLoading" class="space-y-2">
            <div
              v-for="i in 5"
              :key="i"
              class="bg-muted rounded-lg h-24 animate-pulse"
            />
          </div>
          <div v-else>
            <SugestoesList
              :sugestoes="sugestoes"
              @curtir="handleCurtir"
              @descurtir="handleDescurtir"
              @showDetails="handleShowDetails"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes (Futuro) -->
    <!-- Será implementado junto com a parte de banco de dados -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SugestoesForm from '~/components/SugestoesForm.vue'
import SugestoesList from '~/components/SugestoesList.vue'

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

const sugestoes = ref<Sugestao[]>([])
const isLoading = ref(true)

// Dados mock para visualização
const mockSugestoes: Sugestao[] = [
  {
    id: '1',
    titulo: 'Adicionar exportação em PDF para Relatórios',
    descricao: 'Seria muito útil poder exportar os relatórios em PDF com a mesma formatação que aparece na tela, facilitando compartilhamento com o time.',
    categoria: 'funcionalidade',
    empresa_nome: 'TechCorp Brasil',
    empresa_id: 'emp_123',
    usuario_id: 'user_123',
    data_criacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    curtidas: 24,
    comentarios: 5,
    ja_curtiu: false
  },
  {
    id: '2',
    titulo: 'Melhorar responsividade da tabela em mobile',
    descricao: 'A tabela de estoque fica difícil de visualizar em smartphones. Sugerindo um design com scroll horizontal ou cards empilhados.',
    categoria: 'interface',
    empresa_nome: 'Market Soluções',
    empresa_id: 'emp_456',
    usuario_id: 'user_456',
    data_criacao: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    curtidas: 18,
    comentarios: 3,
    ja_curtiu: false
  },
  {
    id: '3',
    titulo: 'Integração com Stripe para pagamentos',
    descricao: 'Seria incrível ter uma integração nativa com Stripe para processar pagamentos de assinatura automaticamente.',
    categoria: 'integracao',
    empresa_nome: 'Digital Empreendimentos',
    empresa_id: 'emp_789',
    usuario_id: 'user_789',
    data_criacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    curtidas: 31,
    comentarios: 8,
    ja_curtiu: true
  },
  {
    id: '4',
    titulo: 'Modo escuro automático por horário',
    descricao: 'Gostaria de ativar automaticamente o modo escuro após uma determinada hora do dia, baseado no fuso horário do usuário.',
    categoria: 'interface',
    empresa_nome: 'NeoStartup',
    empresa_id: 'emp_101',
    usuario_id: 'user_101',
    data_criacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    curtidas: 12,
    comentarios: 2,
    ja_curtiu: false
  },
  {
    id: '5',
    titulo: 'Notificações push no navegador',
    descricao: 'Seria útil receber notificações de eventos importantes mesmo com a aba do browser minimizada ou em background.',
    categoria: 'funcionalidade',
    empresa_nome: 'BusinessFlow',
    empresa_id: 'emp_202',
    usuario_id: 'user_202',
    data_criacao: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    curtidas: 16,
    comentarios: 4,
    ja_curtiu: false
  }
]

onMounted(() => {
  // Simular carregamento
  setTimeout(() => {
    sugestoes.value = mockSugestoes
    isLoading.value = false
  }, 800)
})

const handleCurtir = (id: string) => {
  const sugestao = sugestoes.value.find(s => s.id === id)
  if (sugestao) {
    sugestao.curtidas++
    sugestao.ja_curtiu = true
  }
  console.log('Curtir sugestão:', id)
  // TODO: Implementar ação de banco de dados
}

const handleDescurtir = (id: string) => {
  const sugestao = sugestoes.value.find(s => s.id === id)
  if (sugestao) {
    sugestao.curtidas--
    sugestao.ja_curtiu = false
  }
  console.log('Descurtir sugestão:', id)
  // TODO: Implementar ação de banco de dados
}

const handleShowDetails = (id: string) => {
  console.log('Mostrar detalhes da sugestão:', id)
  // TODO: Implementar modal de detalhes
}
</script>
