<template>
  <div>
    <div class="mb-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <p class="text-xs font-semibold tracking-wide text-muted-foreground">EM DESENVOLVIMENTOS</p>
    </div>
    <EntradasManager />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>
