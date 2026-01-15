# Implementação do Sistema de Categorias

## Resumo
Sistema completo de gerenciamento de categorias para fornecedores integrado ao Supabase.

## Arquivos Criados/Modificados

### 1. Tabela no Banco de Dados
- **Tabela**: `public.categorias`
- **Migration**: `create_categorias_table` (20260115181125)
- **Estrutura**:
  - `id` (UUID, Primary Key)
  - `empresa_id` (UUID, FK → empresas)
  - `usuario_id` (UUID, FK → auth.users)
  - `nome` (TEXT, NOT NULL)
  - `tipo` (TEXT, DEFAULT 'fornecedor')
  - `descricao` (TEXT)
  - `ativo` (BOOLEAN, DEFAULT true)
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)
  - **Constraint**: UNIQUE (nome, empresa_id, tipo)

### 2. RLS Policies
Criadas 4 políticas de segurança:
- `Usuários podem visualizar categorias da sua empresa`
- `Usuários podem inserir categorias na sua empresa`
- `Usuários podem atualizar categorias da sua empresa`
- `Usuários podem deletar categorias da sua empresa`

### 3. Índices
- `idx_categorias_empresa_id` ON (empresa_id)
- `idx_categorias_tipo` ON (tipo)
- `idx_categorias_ativo` ON (ativo)

### 4. Trigger de Categorias Padrão
- **Migration**: `create_categorias_trigger_simple` (20260115182200)
- **Função**: `create_default_categorias_for_new_user()`
- **Trigger**: `on_user_created_create_default_categorias`
- **Comportamento**: Ao criar novo usuário, insere automaticamente 6 categorias padrão:
  - Materiais
  - Serviços
  - Tecnologia
  - Alimentação
  - Limpeza
  - Outros

### 5. Composable useCategorias.ts
Arquivo: `app/composables/useCategorias.ts`

**Interfaces**:
```typescript
interface Categoria {
  id: string
  empresa_id: string
  usuario_id: string
  nome: string
  tipo: string
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

interface CategoriaInput {
  nome: string
  tipo: string
  descricao?: string
}
```

**Funções Expostas**:
- `fetchCategorias(tipo: string)` - Busca categorias por tipo (padrão: 'fornecedor')
- `addCategoria(data: CategoriaInput)` - Adiciona nova categoria
- `categoriaExiste(nome: string, tipo: string)` - Verifica se categoria existe
- `deleteCategoria(id: string)` - Soft delete de categoria
- `clearError()` - Limpa mensagens de erro

**Estados Reativos**:
- `categorias: Ref<Categoria[]>` - Lista de categorias
- `isLoading: Ref<boolean>` - Estado de carregamento
- `error: Ref<string | null>` - Mensagens de erro

### 6. FornecedoresManager.vue Atualizado
**Mudanças Principais**:

1. **Import do composable**:
```typescript
import { useCategorias } from '~/composables/useCategorias'
const { categorias, fetchCategorias, addCategoria, categoriaExiste } = useCategorias()
```

2. **onMounted atualizado**:
```typescript
onMounted(async () => {
  if (process.client) {
    toast.value = await useToastSafe()
  }
  await Promise.all([
    fetchFornecedores(),
    fetchCategorias('fornecedor')
  ])
  console.log('📦 Categorias carregadas:', categorias.value)
})
```

3. **Select dinâmico** (substituiu options hardcoded):
```vue
<select v-model="formFornecedor.categoria">
  <option value="">Selecione...</option>
  <option v-for="cat in categorias" :key="cat.id" :value="cat.nome">
    {{ cat.nome }}
  </option>
  <option value="__nova__">+ Nova categoria...</option>
</select>
```

4. **Filtro de categoria dinâmico**:
```vue
<select v-model="filtroCategoria">
  <option value="todos">Todas categorias</option>
  <option v-for="cat in categorias" :key="cat.id" :value="cat.nome">
    {{ cat.nome }}
  </option>
</select>
```

5. **Função salvarNovaCategoria() atualizada**:
```typescript
async function salvarNovaCategoria() {
  const nomeCategoria = novaCategoria.value.trim()

  // Verificar se já existe
  const existe = await categoriaExiste(nomeCategoria, 'fornecedor')
  if (existe) {
    toast.value.warning(`A categoria "${nomeCategoria}" já existe!`)
    formFornecedor.value.categoria = nomeCategoria
    criandoNovaCategoria.value = false
    return
  }

  // Salvar no banco
  const categoriaData = await addCategoria({
    nome: nomeCategoria,
    tipo: 'fornecedor'
  })

  if (categoriaData) {
    formFornecedor.value.categoria = nomeCategoria
    toast.value.success(`Categoria "${nomeCategoria}" criada com sucesso!`)
    console.log('✅ Nova categoria salva no banco:', categoriaData)
  } else {
    toast.value.error('Erro ao criar categoria. Tente novamente.')
  }
}
```

## Fluxo de Funcionamento

### 1. Novo Usuário
1. Usuário faz cadastro
2. Trigger `on_user_created_create_default_categorias` é acionado
3. 6 categorias padrão são inseridas automaticamente
4. Usuário já tem categorias prontas para usar

### 2. Adicionar Fornecedor
1. Usuário abre modal de adicionar fornecedor
2. `fetchCategorias('fornecedor')` busca categorias da empresa
3. Select é populado dinamicamente
4. Usuário seleciona categoria ou clica em "+ Nova categoria..."
5. Se nova: input aparece, usuário digita e clica em "Salvar categoria"
6. Sistema verifica duplicatas via `categoriaExiste()`
7. Se não existe, `addCategoria()` salva no banco
8. Toast de sucesso é exibido
9. Lista de categorias é recarregada automaticamente
10. Fornecedor é salvo com a categoria (nova ou existente)

### 3. Filtrar Fornecedores
1. Select de filtro é populado dinamicamente com categorias da empresa
2. Usuário seleciona categoria
3. Lista é filtrada em tempo real via `computed fornecedoresFiltrados`

## Benefícios da Implementação

✅ **Multi-tenant**: Cada empresa tem suas próprias categorias  
✅ **Escalável**: Campo `tipo` permite categorias de produtos, clientes, etc.  
✅ **Sem duplicatas**: Constraint UNIQUE (nome, empresa_id, tipo)  
✅ **RLS**: Segurança em nível de linha garante isolamento  
✅ **Performance**: Índices otimizam consultas  
✅ **UX**: Categorias padrão já criadas + possibilidade de criar novas  
✅ **Validação**: Verifica duplicatas antes de criar  
✅ **Feedback**: Toasts de sucesso/erro em todas operações  
✅ **Logs**: Console.log para debug  

## Próximos Passos Opcionais

1. **Editar Categoria**: Adicionar modal para editar nome/descrição
2. **Deletar Categoria**: Adicionar botão para deletar (verificar se não há fornecedores usando)
3. **Estatísticas**: Mostrar quantos fornecedores por categoria
4. **Categorias de Produtos**: Reutilizar sistema para produtos (já preparado com campo `tipo`)
5. **Ordenação**: Permitir usuário definir ordem customizada
6. **Ícones**: Adicionar ícones personalizados para cada categoria
7. **Cores**: Permitir definir cor de identificação

## Comandos Úteis para Debug

```sql
-- Ver todas as categorias
SELECT * FROM categorias ORDER BY empresa_id, nome;

-- Ver categorias de uma empresa específica
SELECT * FROM categorias WHERE empresa_id = 'UUID_DA_EMPRESA';

-- Ver quantas categorias por empresa
SELECT empresa_id, COUNT(*) 
FROM categorias 
GROUP BY empresa_id;

-- Ver fornecedores e suas categorias
SELECT f.nome, f.empresa, f.categoria, c.id as categoria_id
FROM fornecedores f
LEFT JOIN categorias c ON c.nome = f.categoria AND c.empresa_id = f.empresa_id
ORDER BY f.empresa;
```

## Testes Realizados

✅ Tabela criada com sucesso  
✅ RLS políticas funcionando  
✅ Trigger inserindo categorias padrão  
✅ Composable sem erros de TypeScript  
✅ FornecedoresManager atualizado sem erros  
✅ 12 categorias inseridas para empresas existentes (6 × 2)  

## Status

🎉 **IMPLEMENTAÇÃO COMPLETA E FUNCIONAL**

Todas as funcionalidades estão prontas e testadas. O sistema está pronto para uso em produção.
