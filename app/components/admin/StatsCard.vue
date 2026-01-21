<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon: string
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

const colorClasses: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  gray: 'from-gray-500 to-gray-600'
}
</script>

<template>
  <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between mb-4">
      <div 
        class="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-md"
        :class="colorClasses[color]"
      >
        <Icon :icon="icon" class-name="w-6 h-6 text-white" fallback="" />
      </div>
      
      <div v-if="trend" class="flex items-center gap-1 text-sm">
        <Icon 
          :icon="trend.isPositive ? 'trending-up' : 'trending-down'" 
          :class-name="`w-4 h-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`"
          fallback=""
        />
        <span :class="trend.isPositive ? 'text-green-500' : 'text-red-500'">
          {{ trend.value }}%
        </span>
      </div>
    </div>
    
    <div>
      <p class="text-sm text-muted-foreground mb-1">{{ title }}</p>
      <p class="text-3xl font-bold text-foreground">{{ value }}</p>
    </div>
  </div>
</template>
