<template>
  <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-border shadow-sm p-5">
    <div class="flex items-start gap-3 mb-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xl flex-shrink-0">
        💡
      </div>
      <div>
        <h3 class="text-base font-semibold text-foreground">Dica do dia</h3>
        <p class="text-xs text-muted-foreground">{{ currentTip.category }}</p>
      </div>
    </div>
    
    <p class="text-sm text-foreground leading-relaxed mb-4">
      {{ currentTip.text }}
    </p>
    
    <button class="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
      Saiba mais
      <span>→</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const tips = [
  {
    id: 1,
    category: 'Precificação',
    text: 'Não se esqueça de incluir TODOS os custos na hora de calcular o preço: matéria-prima, embalagem, energia, mão de obra e impostos. Muitos empreendedores esquecem dos custos indiretos!'
  },
  {
    id: 2,
    category: 'Margem de Lucro',
    text: 'A margem de lucro ideal varia por segmento. No varejo, costuma ser entre 20-40%. Pesquise seu mercado e não copie a concorrência sem analisar seus próprios custos.'
  },
  {
    id: 3,
    category: 'Controle de Estoque',
    text: 'Faça inventário regular! Mesmo com sistema automatizado, a contagem física mensal previne perdas e identifica produtos parados que podem estar consumindo seu capital.'
  },
  {
    id: 4,
    category: 'Fluxo de Caixa',
    text: 'Separe sempre 10-15% do faturamento para reserva de emergência. Um bom fluxo de caixa é mais importante que lucro alto no curto prazo.'
  }
]

// Seleciona uma dica aleatória
const currentTip = ref(tips[Math.floor(Math.random() * tips.length)])
</script>
