# Configuração de Entradas e Saídas - Controle Fácil

## 📋 Estrutura Criada

### 1. Tabelas no Supabase

Foram criadas duas tabelas principais:

#### **entradas** (Receitas)
- `id`: UUID (chave primária)
- `empresa_id`: UUID (referência à empresa)
- `usuario_id`: UUID (usuário que registrou)
- `descricao`: Texto
- `valor`: Decimal (10,2)
- `data`: Timestamp
- `categoria`: Varchar (Vendas, Serviços, Outros Recebimentos)
- `forma_recebimento`: Varchar (Pix, Dinheiro, Cartão, Transferência, Outro)
- `status`: Varchar (Confirmada, Pendente)
- `observacoes`: Texto (opcional)
- `created_at`, `updated_at`: Timestamps

#### **saidas** (Despesas)
- `id`: UUID (chave primária)
- `empresa_id`: UUID (referência à empresa)
- `usuario_id`: UUID (usuário que registrou)
- `descricao`: Texto
- `valor`: Decimal (10,2)
- `data`: Timestamp
- `categoria`: Varchar (Aluguel, Água, Energia, Telefone/Internet, Fornecedores, Pagamento Funcionário, Vale Funcionário, Impostos, Manutenção, Outros)
- `forma_pagamento`: Varchar (Dinheiro, PIX, Cartão, Transferência, Boleto)
- `status`: Varchar (Paga, Pendente, Vencida)
- `funcionario`: Varchar (apenas para "Vale Funcionário")
- `observacoes`: Texto (opcional)
- `created_at`, `updated_at`: Timestamps

### 2. Composables Criados

- **useEntradas.ts**: CRUD completo para entradas com integração Supabase
- **useSaidas.ts**: CRUD completo para saídas com integração Supabase

Ambos incluem:
- Fetch, Add, Update, Delete
- Cálculo de resumos (dia, semana, mês, ano)
- Toast notifications
- Error handling

### 3. Arquivos SQL de Migração

- `supabase/migrations/create_entradas_table.sql`
- `supabase/migrations/create_saidas_table.sql`

## ✅ Migrations Executadas

As tabelas **entradas** e **saidas** foram criadas automaticamente via **Supabase MCP** e já estão disponíveis no banco de dados.

**Status:**
- ✅ Tabela `entradas` criada com RLS habilitado
- ✅ Tabela `saidas` criada com RLS habilitado
- ✅ Índices criados para performance
- ✅ Policies configuradas para isolamento por empresa
- ✅ Triggers de updated_at configurados

## 🔧 Próximos Passos

### 1. Atualizar Componentes de Entradas e Saídas

Substituir os dados mockados pelos composables reais:

**EntradasManager.vue:**
```typescript
// Adicionar no topo do script
const { entradas, isLoading, fetchEntradas, addEntrada, updateEntrada, deleteEntrada } = useEntradas()

// No onMounted
onMounted(async () => {
  await fetchEntradas()
})
```

**SaidasManager.vue:**
```typescript
// Adicionar no topo do script
const { saidas, isLoading, fetchSaidas, addSaida, updateSaida, deleteSaida } = useSaidas()

// No onMounted
onMounted(async () => {
  await fetchSaidas()
})
```

### 2. Atualizar Dashboard

**DashboardOverview.vue:**
```typescript
// Adicionar composables
const { calcularResumo: calcularResumoEntradas } = useEntradas()
const { calcularResumo: calcularResumoSaidas } = useSaidas()

// Atualizar computed metrics
const entradasMes = await calcularResumoEntradas('mes')
const saidasMes = await calcularResumoSaidas('mes')
```

### 3. Gráfico de Vendas Mensais

Criar função para buscar vendas dos últimos 6 meses e alimentar o gráfico:

```typescript
const vendasUltimosMeses = computed(() => {
  const meses = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const mes = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mesNome = mes.toLocaleDateString('pt-BR', { month: 'short' })
    
    const total = entradas.value
      .filter(e => {
        const dataEntrada = new Date(e.data)
        return dataEntrada.getMonth() === mes.getMonth() && 
               dataEntrada.getFullYear() === mes.getFullYear() &&
               e.status === 'Confirmada'
      })
      .reduce((sum, e) => sum + e.valor, 0)
    
    meses.push({ mes: mesNome, valor: total })
  }
  
  return meses
})
```

## ✅ Funcionalidades Implementadas

- ✅ Tabelas com RLS (Row Level Security)
- ✅ Políticas de acesso por empresa
- ✅ Índices para performance
- ✅ Triggers para updated_at automático
- ✅ Validação de valores (>= 0)
- ✅ Relacionamento com empresas e usuários
- ✅ CRUD completo via composables
- ✅ Toast notifications em todas as ações
- ✅ Cálculo de resumos por período
- ✅ Suporte a "Vale Funcionário" com campo específico

## 🔒 Segurança

- **RLS habilitado**: Usuários só veem dados da própria empresa
- **Validações**: Checks no banco garantem integridade
- **Auth obrigatório**: Todas as operações requerem autenticação
- **Cascade delete**: Dados removidos ao deletar empresa

## 📊 Próximas Melhorias Sugeridas

1. Adicionar campo `recorrente` para despesas fixas
2. Implementar anexo de comprovantes (storage)
3. Criar relatórios PDF exportáveis
4. Dashboard com gráficos comparativos
5. Alertas de despesas vencidas
6. Categorias personalizáveis por empresa
