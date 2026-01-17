<script setup lang="ts">
// Dashboard principal do sistema
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>

<template>
  <div>
    <DashboardOverview />
  </div>
</template>
