<template>
  <div class="flex gap-6 p-6 min-h-[calc(100vh-8rem)]">
    <!-- Submenu Lateral da Comunidade -->
    <CommunitySidebar class="hidden lg:block w-64 flex-shrink-0" />
    
    <!-- Feed Central -->
    <div class="flex-1 min-w-0">
      <CommunityFeed />
    </div>
    
    <!-- Barra Lateral Direita -->
    <CommunityRightbar class="hidden xl:block w-80 flex-shrink-0" />
  </div>
</template>

<script setup lang="ts">
</script>
