<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const pacotes = [
  {
    id: 1,
    nome: 'Básico',
    tokens: 100000,
    tokensFormatado: '100 mil',
    preco: 9.90,
    badge: '',
    cor: 'blue',
    icon: '🎯',
    destaque: false
  },
  {
    id: 2,
    nome: 'Popular',
    tokens: 300000,
    tokensFormatado: '300 mil',
    preco: 17.90,
    badge: 'Mais Vendido',
    cor: 'purple',
    icon: '⭐',
    destaque: true
  },
  {
    id: 3,
    nome: 'Premium',
    tokens: 500000,
    tokensFormatado: '500 mil',
    preco: 24.90,
    badge: 'Melhor Custo',
    cor: 'green',
    icon: '💎',
    destaque: false
  },
  {
    id: 4,
    nome: 'Mega',
    tokens: 1000000,
    tokensFormatado: '1 milhão',
    preco: 39.90,
    badge: '',
    cor: 'orange',
    icon: '🚀',
    destaque: false
  }
]

const comprarPacote = (pacote: typeof pacotes[0]) => {
  // TODO: Implementar integração com gateway de pagamento
  console.log('Comprando pacote:', pacote)
  alert(`Funcionalidade em desenvolvimento!\n\nVocê selecionou o pacote ${pacote.nome} com ${pacote.tokensFormatado} tokens por R$ ${pacote.preco.toFixed(2)}`)
}

const getCorClasses = (cor: string, destaque: boolean) => {
  const cores = {
    blue: {
      bg: 'from-blue-50/30 to-cyan-50/20 dark:from-blue-950/10 dark:to-cyan-950/5',
      border: 'border-blue-200/40 dark:border-blue-800/20',
      text: 'text-blue-700 dark:text-blue-400',
      button: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
    },
    purple: {
      bg: 'from-purple-50/30 to-pink-50/20 dark:from-purple-950/10 dark:to-pink-950/5',
      border: 'border-purple-200/40 dark:border-purple-800/20',
      text: 'text-purple-700 dark:text-purple-400',
      button: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
    },
    green: {
      bg: 'from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/10 dark:to-teal-950/5',
      border: 'border-emerald-200/40 dark:border-emerald-800/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      button: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
    },
    orange: {
      bg: 'from-orange-50/30 to-amber-50/20 dark:from-orange-950/10 dark:to-amber-950/5',
      border: 'border-orange-200/40 dark:border-orange-800/20',
      text: 'text-orange-700 dark:text-orange-400',
      button: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
    }
  }
  return cores[cor as keyof typeof cores]
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Cabeçalho -->
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Pacotes de Tokens Adicionais
      </h1>
      <p class="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
        Adquira tokens extras para usar o Mentor IA além da sua cota mensal. Tokens não expiram e podem ser usados a qualquer momento.
      </p>
    </div>

    <!-- Grid de Pacotes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="pacote in pacotes"
        :key="pacote.id"
        :class="[
          'relative bg-gradient-to-br p-3 rounded-lg border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
          getCorClasses(pacote.cor, pacote.destaque).bg,
          getCorClasses(pacote.cor, pacote.destaque).border,
          pacote.destaque ? 'ring-1 ring-purple-500/30 dark:ring-purple-400/20 scale-[1.02]' : ''
        ]"
      >
        <!-- Badge de Destaque -->
        <div
          v-if="pacote.badge"
          class="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full shadow-md"
        >
          {{ pacote.badge }}
        </div>

        <!-- Ícone -->
        <div class="text-center mb-3">
          <span class="text-3xl">{{ pacote.icon }}</span>
        </div>

        <!-- Nome do Pacote -->
        <h3 :class="['text-lg font-bold text-center mb-2', getCorClasses(pacote.cor, pacote.destaque).text]">
          {{ pacote.nome }}
        </h3>

        <!-- Quantidade de Tokens -->
        <div class="text-center mb-3">
          <p :class="['text-2xl font-extrabold', getCorClasses(pacote.cor, pacote.destaque).text]">
            {{ pacote.tokensFormatado }}
          </p>
          <p class="text-[10px] text-muted-foreground mt-0.5">tokens</p>
        </div>

        <!-- Preço -->
        <div class="text-center mb-3">
          <p class="text-[10px] text-muted-foreground line-through">De R$ {{ (pacote.preco * 1.5).toFixed(2).replace('.', ',') }}</p>
          <p class="text-3xl font-bold text-foreground">
            R$ {{ pacote.preco.toFixed(2).replace('.', ',') }}
          </p>
          <p class="text-[10px] text-muted-foreground mt-0.5">pagamento único</p>
        </div>

        <!-- Benefícios -->
        <div class="space-y-1.5 mb-4">
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="text-green-500 text-sm">✓</span>
            <span>Tokens não expiram</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="text-green-500 text-sm">✓</span>
            <span>Uso ilimitado</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="text-green-500 text-sm">✓</span>
            <span>Suporte prioritário</span>
          </div>
          <div v-if="pacote.destaque" class="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span class="text-purple-500 text-sm">⭐</span>
            <span>Economia de 30%</span>
          </div>
        </div>

        <!-- Botão de Compra -->
        <button
          @click="comprarPacote(pacote)"
          :class="[
            'w-full py-2 px-3 rounded-lg font-semibold text-white text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-1.5',
            'bg-gradient-to-r',
            getCorClasses(pacote.cor, pacote.destaque).button
          ]"
        >
          <span class="text-base">🛒</span>
          <span>Comprar Agora</span>
        </button>
      </div>
    </div>

    <!-- Informações Adicionais -->
    <div class="mt-8 bg-gradient-to-br from-blue-50/20 to-cyan-50/10 dark:from-blue-950/10 dark:to-cyan-950/5 border border-blue-200/30 dark:border-blue-800/20 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>ℹ️</span>
        <span>Informações Importantes</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div class="flex items-start gap-2">
          <span class="text-blue-500 text-base flex-shrink-0">🔒</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Pagamento Seguro</p>
            <p>Transações protegidas com criptografia de ponta a ponta</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-green-500 text-base flex-shrink-0">♻️</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Tokens Permanentes</p>
            <p>Seus tokens nunca expiram e ficam disponíveis quando precisar</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-purple-500 text-base flex-shrink-0">💬</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Suporte 24/7</p>
            <p>Atendimento dedicado para assinantes premium</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-orange-500 text-base flex-shrink-0">📊</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Controle Total</p>
            <p>Acompanhe seu consumo em tempo real pelo dashboard</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="mt-8 bg-card border border-border rounded-lg p-6">
      <h3 class="text-lg font-semibold text-foreground mb-4">Perguntas Frequentes</h3>
      <div class="space-y-4">
        <div>
          <p class="font-semibold text-foreground mb-1">O que são tokens?</p>
          <p class="text-sm text-muted-foreground">Tokens são unidades que permitem você usar o Mentor IA. Cada mensagem consome uma quantidade de tokens baseada no tamanho da resposta.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Os tokens expiram?</p>
          <p class="text-sm text-muted-foreground">Não! Seus tokens ficam disponíveis permanentemente na sua conta.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Posso comprar mais de um pacote?</p>
          <p class="text-sm text-muted-foreground">Sim! Os tokens se acumulam na sua conta. Você pode comprar quantos pacotes quiser.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Como funciona o pagamento?</p>
          <p class="text-sm text-muted-foreground">Aceitamos pagamentos via Pix somente para esse serviço. O processamento é instantâneo.</p>
        </div>
      </div>
    </div>
  </div>
</template>
