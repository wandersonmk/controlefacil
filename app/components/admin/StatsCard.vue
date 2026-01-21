<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  emoji?: string
  color?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  emoji: '📊',
  subtitle: ''
})

const colorClasses: Record<string, { bg: string, text: string, border: string }> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  }
}
</script>

<template>
  <div 
    class="p-1.5 rounded-md border shadow-sm"
    :class="[colorClasses[color].bg, colorClasses[color].border]"
  >
    <div class="flex items-start justify-between mb-1">
      <span 
        class="text-[11px] font-medium leading-none"
        :class="colorClasses[color].text"
      >
        {{ title }}
      </span>
      <span class="text-sm leading-none">{{ emoji }}</span>
    </div>
    
    <p 
      class="text-lg font-bold leading-none mb-1"
      :class="colorClasses[color].text"
    >
      {{ value }}
    </p>
    
    <p class="text-[9px] text-muted-foreground leading-none">
      {{ subtitle || 'Total registrado' }}
    </p>
  </div>
</template>
