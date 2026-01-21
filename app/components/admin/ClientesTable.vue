<script setup lang="ts">
import type { AdminCliente } from '~/composables/useAdminClientes'

interface Props {
  clientes: AdminCliente[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'desativar': [clienteId: string]
  'reativar': [clienteId: string]
  'renovar': [clienteId: string]
  'renovar-tokens': [clienteId: string]
  'editar': [clienteId: string]
  'excluir': [clienteId: string]
}>()

const { formatDate, getStatusColor, getPlanLabel, isVencido, diasParaVencimento, formatDiasVencimento } = useAdminClientes()

const statusLabels: Record<string, string> = {
  trial: 'Trial',
  active: 'Ativo',
  canceled: 'Cancelado',
  expired: 'Expirado'
}

// Formata número de telefone para WhatsApp (remove caracteres especiais)
const formatWhatsAppUrl = (whatsapp: string | null): string => {
  if (!whatsapp) return ''
  const cleanNumber = whatsapp.replace(/\D/g, '')
  return `https://wa.me/55${cleanNumber}`
}
</script>

<template>
  <div class="bg-card border border-border rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-muted/50 border-b border-border">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cliente
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Plano
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Vencimento
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dias Restantes
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tokens
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ativo
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-if="loading">
            <td colspan="8" class="px-6 py-12 text-center">
              <AppLoading />
            </td>
          </tr>
          
          <tr 
            v-else
            v-for="cliente in clientes" 
            :key="cliente.id"
            class="hover:bg-muted/30 transition-colors"
            :class="{ 'opacity-60': !cliente.ativo }"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-foreground">{{ cliente.nome }}</span>
                  <span 
                    v-if="cliente.role === 'superAdmin'"
                    class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm"
                    title="Super Administrador"
                  >
                    👑 SUPER ADMIN
                  </span>
                </div>
                <div class="text-xs text-muted-foreground">{{ cliente.email }}</div>
                <div v-if="cliente.whatsapp" class="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {{ cliente.whatsapp }}
                  <a 
                    :href="formatWhatsAppUrl(cliente.whatsapp)" 
                    target="_blank"
                    class="text-green-600 hover:text-green-700 transition-colors"
                    title="Abrir WhatsApp"
                  >
                    <Icon icon="phone" class-name="w-4 h-4" fallback="📱" />
                  </a>
                </div>
              </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                :class="getStatusColor(cliente.subscription_status)"
              >
                {{ statusLabels[cliente.subscription_status] }}
              </span>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-foreground">{{ getPlanLabel(cliente.subscription_plan) }}</div>
              <div class="text-xs text-muted-foreground">
                {{ cliente.subscription_period === 'trial' ? 'Trial' : cliente.subscription_period.replace('month', ' mês').replace('s', 'es') }}
              </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm">
                <span 
                  :class="isVencido(cliente) ? 'text-red-500 font-semibold' : 'text-foreground'"
                >
                  {{ formatDate(cliente.trial_ends_at || cliente.subscription_renews_at) }}
                </span>
              </div>
              <div v-if="isVencido(cliente)" class="text-xs text-red-500 font-medium">
                Vencido
              </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm">
                <span 
                  :class="{
                    'text-red-500 font-semibold': diasParaVencimento(cliente) < 0,
                    'text-orange-500 font-medium': diasParaVencimento(cliente) >= 0 && diasParaVencimento(cliente) <= 7,
                    'text-green-600': diasParaVencimento(cliente) > 7
                  }"
                >
                  {{ formatDiasVencimento(cliente) }}
                </span>
              </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div class="flex-1 min-w-[100px]">
                  <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all"
                      :class="cliente.available_tokens > 0 ? 'bg-green-500' : 'bg-red-500'"
                      :style="{ width: `${(cliente.available_tokens / cliente.total_tokens) * 100}%` }"
                    ></div>
                  </div>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ cliente.available_tokens.toLocaleString() }} / {{ cliente.total_tokens.toLocaleString() }}
                  </div>
                </div>
              </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                :class="cliente.ativo ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
              >
                {{ cliente.ativo ? 'Sim' : 'Não' }}
              </span>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="emit('editar', cliente.id)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  title="Editar Cliente"
                >
                  <Icon icon="edit" class-name="w-5 h-5" fallback="✏️" />
                </button>
                
                <button
                  @click="emit('renovar-tokens', cliente.id)"
                  class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  title="Renovar Tokens"
                >
                  <Icon icon="sync" class-name="w-5 h-5" fallback="🔄" />
                </button>
                
                <button
                  @click="emit('renovar', cliente.id)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  title="Renovar Assinatura"
                >
                  <Icon icon="calendar" class-name="w-5 h-5" fallback="📅" />
                </button>
                
                <button
                  v-if="cliente.ativo && cliente.role !== 'superAdmin'"
                  @click="emit('desativar', cliente.id)"
                  class="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                  title="Desativar Cliente"
                >
                  <Icon icon="times-circle" class-name="w-5 h-5" fallback="⏸️" />
                </button>
                
                <button
                  v-if="!cliente.ativo && cliente.role !== 'superAdmin'"
                  @click="emit('reativar', cliente.id)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  title="Reativar Cliente"
                >
                  <Icon icon="check-circle" class-name="w-5 h-5" fallback="▶️" />
                </button>
                
                <button
                  v-if="cliente.role !== 'superAdmin'"
                  @click="emit('excluir', cliente.id)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Excluir Cliente"
                >
                  <Icon icon="trash" class-name="w-5 h-5" fallback="🗑️" />
                </button>
              </div>
            </td>
          </tr>
          
          <tr v-if="!loading && clientes.length === 0">
            <td colspan="8" class="px-6 py-12 text-center text-muted-foreground">
              Nenhum cliente encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
