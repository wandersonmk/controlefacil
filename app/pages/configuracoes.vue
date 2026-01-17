<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>

<template>
  <div>
    <ClientOnly>
      <ConfiguracoesManager />
      <template #fallback>
        <AppLoading 
          title="Carregando Configurações"
          description="Preparando a área de configurações..."
        />
      </template>
    </ClientOnly>
  </div>
</template>
