<script setup lang="ts">
// Página acessível independente de autenticação
// Removido middleware para permitir acesso após cadastro

// Meta tags para SEO
useHead({
  title: 'Obrigado - Controle Fácil',
  meta: [
    { name: 'description', content: 'Obrigado por se cadastrar no Controle Fácil Gestão de Relatórios' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <ThankYouCard />
</template>
