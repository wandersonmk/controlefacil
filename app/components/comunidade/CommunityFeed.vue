<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-foreground">Feed</h2>
        <p class="text-sm text-muted-foreground">Acompanhe as discussões da comunidade</p>
      </div>
      
      <div class="flex items-center gap-3">
        <select class="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option>Mais recente</option>
          <option>Mais popular</option>
          <option>Mais comentado</option>
        </select>
        
        <button class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          <span class="text-lg">✏️</span>
          <span class="hidden sm:inline">Nova publicação</span>
        </button>
      </div>
    </div>

    <!-- Card para criar post -->
    <CreatePostCard />

    <!-- Lista de Posts -->
    <div class="space-y-4">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
      />
    </div>

    <!-- Mensagem de fim -->
    <div class="text-center py-8">
      <p class="text-sm text-muted-foreground">Você viu todas as publicações recentes</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const posts = [
  {
    id: 1,
    author: {
      name: 'Maria Silva',
      avatar: '👩‍💼',
      role: 'Empreendedora'
    },
    date: '2 horas atrás',
    title: 'Como calcular o markup ideal para meu produto?',
    content: 'Pessoal, estou começando agora e tenho dúvida sobre como definir o preço de venda. Alguém tem uma dica de como calcular o markup correto considerando todos os custos?',
    likes: 24,
    comments: 8,
    category: 'Precificação'
  },
  {
    id: 2,
    author: {
      name: 'João Santos',
      avatar: '👨‍💻',
      role: 'Gestor Comercial'
    },
    date: '5 horas atrás',
    title: 'Minha história: de 10 para 100 produtos em 6 meses',
    content: 'Quero compartilhar com vocês como consegui aumentar meu catálogo usando o sistema de controle de estoque. Foi fundamental para o crescimento do meu negócio!',
    likes: 67,
    comments: 23,
    category: 'Histórias de Sucesso'
  },
  {
    id: 3,
    author: {
      name: 'Ana Rodrigues',
      avatar: '👩‍🔬',
      role: 'Consultora Financeira'
    },
    date: '1 dia atrás',
    title: 'Dica: Como aumentar sua margem de lucro sem perder clientes',
    content: 'Vou compartilhar 5 estratégias que apliquei no meu negócio e aumentaram a margem em 15% sem aumentar preços drasticamente. Primeira dica: revise seus fornecedores!',
    likes: 89,
    comments: 34,
    category: 'Lucro & Margem'
  },
  {
    id: 4,
    author: {
      name: 'Carlos Mendes',
      avatar: '👨‍🍳',
      role: 'Restaurante'
    },
    date: '2 dias atrás',
    title: 'Controle de estoque salvou meu restaurante',
    content: 'Estava perdendo muito com desperdício até implementar um controle rigoroso. Hoje economizo cerca de R$ 2.000/mês apenas controlando melhor as entradas e saídas.',
    likes: 142,
    comments: 56,
    category: 'Estoque'
  }
]
</script>
