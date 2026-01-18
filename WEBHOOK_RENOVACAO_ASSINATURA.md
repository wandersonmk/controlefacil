# 📋 Guia Completo: Renovação de Assinatura via Webhook N8N

## 🎯 Objetivo
Este documento explica como renovar a assinatura de um cliente quando receber o webhook de pagamento aprovado do Kiwify/gateway de pagamento.

---

## 📊 Estrutura do Banco de Dados

### 🏢 Tabela: `empresas`
Armazena informações da assinatura da empresa.

**Campos importantes para atualizar:**

| Campo | Tipo | Valores Possíveis | Descrição |
|-------|------|-------------------|-----------|
| `subscription_status` | text | `'trial'`, `'active'`, `'canceled'`, `'expired'` | Status da assinatura |
| `subscription_plan` | text | `'free'`, `'basic'`, `'pro'`, `'enterprise'` | Plano contratado |
| `subscription_period` | text | `'trial'`, `'1month'`, `'6months'`, `'12months'` | Período do plano |
| `subscription_renews_at` | timestamptz | Data/hora | Próxima renovação |
| `trial_ends_at` | timestamptz | Data/hora | Fim do período de trial |

### 💰 Tabela: `user_token_balance`
Armazena o saldo de tokens do usuário (Mentor IA).

**Campos importantes:**

| Campo | Tipo | Valor Padrão | Descrição |
|-------|------|--------------|-----------|
| `user_id` | uuid | - | ID do usuário (auth_user_id) |
| `total_tokens` | integer | 10000 | Total de tokens acumulados |
| `used_tokens` | integer | 0 | Tokens já consumidos |
| `available_tokens` | integer | calculado | Disponíveis (automático) |
| `plan_type` | text | 'free' | Tipo do plano |

---

## 🔄 Mapeamento de Planos

### 📦 Planos vs Campos do Banco

| Plano Kiwify | `subscription_plan` | `subscription_period` | Tokens a Adicionar | Duração |
|--------------|---------------------|----------------------|-------------------|---------|
| **Mensal** | `'basic'` | `'1month'` | 100.000 | 30 dias |
| **Semestral** | `'pro'` | `'6months'` | 250.000 | 180 dias |
| **Anual** | `'enterprise'` | `'12months'` | 500.000 | 365 dias |

---

## 🛠️ Fluxo de Renovação no N8N

### 1️⃣ Receber Webhook do Pagamento

```json
{
  "status": "approved",
  "customer_email": "cliente@exemplo.com",
  "product_id": "mensal|semestral|anual",
  "transaction_id": "xxx"
}
```

### 2️⃣ Buscar Empresa pelo Email

```sql
SELECT id, auth_user_id 
FROM empresas 
WHERE email = 'cliente@exemplo.com';
```

**Variáveis obtidas:**
- `empresa_id` → ID da empresa
- `auth_user_id` → ID do usuário (para tokens)

---

### 3️⃣ Atualizar Tabela `empresas`

**Query SQL para renovação:**

```sql
UPDATE empresas
SET 
  subscription_status = 'active',
  subscription_plan = CASE 
    WHEN produto = 'mensal' THEN 'basic'
    WHEN produto = 'semestral' THEN 'pro'
    WHEN produto = 'anual' THEN 'enterprise'
  END,
  subscription_period = CASE 
    WHEN produto = 'mensal' THEN '1month'
    WHEN produto = 'semestral' THEN '6months'
    WHEN produto = 'anual' THEN '12months'
  END,
  subscription_renews_at = CASE 
    WHEN produto = 'mensal' THEN NOW() + INTERVAL '30 days'
    WHEN produto = 'semestral' THEN NOW() + INTERVAL '180 days'
    WHEN produto = 'anual' THEN NOW() + INTERVAL '365 days'
  END,
  trial_ends_at = NULL,
  updated_at = NOW()
WHERE email = 'cliente@exemplo.com';
```

---

### 4️⃣ Adicionar/Atualizar Tokens

**Verificar se usuário já tem registro:**

```sql
SELECT id, total_tokens, used_tokens 
FROM user_token_balance 
WHERE user_id = 'auth_user_id_obtido';
```

#### ✅ Se registro EXISTE (renovação):

```sql
UPDATE user_token_balance
SET 
  total_tokens = total_tokens + CASE 
    WHEN plano = 'mensal' THEN 100000
    WHEN plano = 'semestral' THEN 250000
    WHEN plano = 'anual' THEN 500000
  END,
  plan_type = CASE 
    WHEN plano = 'mensal' THEN 'basic'
    WHEN plano = 'semestral' THEN 'pro'
    WHEN plano = 'anual' THEN 'enterprise'
  END,
  updated_at = NOW()
WHERE user_id = 'auth_user_id_obtido';
```

> **⚠️ IMPORTANTE:** Use `total_tokens = total_tokens + valor` para **ACUMULAR** tokens, não substituir!

#### 🆕 Se registro NÃO EXISTE (primeira assinatura):

```sql
INSERT INTO user_token_balance (user_id, total_tokens, used_tokens, plan_type)
VALUES (
  'auth_user_id_obtido',
  CASE 
    WHEN plano = 'mensal' THEN 100000
    WHEN plano = 'semestral' THEN 250000
    WHEN plano = 'anual' THEN 500000
  END,
  0,
  CASE 
    WHEN plano = 'mensal' THEN 'basic'
    WHEN plano = 'semestral' THEN 'pro'
    WHEN plano = 'anual' THEN 'enterprise'
  END
);
```

---

## 📝 Exemplo Completo em N8N (JavaScript)

```javascript
// 1. Dados do webhook
const email = $json.customer_email;
const produto = $json.product_id; // 'mensal', 'semestral' ou 'anual'

// 2. Mapear plano
const planoMap = {
  'mensal': { plan: 'basic', period: '1month', tokens: 100000, dias: 30 },
  'semestral': { plano: 'pro', period: '6months', tokens: 250000, dias: 180 },
  'anual': { plan: 'enterprise', period: '12months', tokens: 500000, dias: 365 }
};

const config = planoMap[produto];

// 3. Calcular data de renovação
const dataRenovacao = new Date();
dataRenovacao.setDate(dataRenovacao.getDate() + config.dias);

// 4. Query para atualizar empresa
const queryEmpresa = `
  UPDATE empresas
  SET 
    subscription_status = 'active',
    subscription_plan = '${config.plan}',
    subscription_period = '${config.period}',
    subscription_renews_at = '${dataRenovacao.toISOString()}',
    trial_ends_at = NULL,
    updated_at = NOW()
  WHERE email = '${email}'
  RETURNING id, auth_user_id;
`;

// 5. Query para adicionar tokens (ACUMULAR)
const queryTokens = `
  INSERT INTO user_token_balance (user_id, total_tokens, used_tokens, plan_type)
  VALUES ($1, ${config.tokens}, 0, '${config.plan}')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_tokens = user_token_balance.total_tokens + ${config.tokens},
    plan_type = '${config.plan}',
    updated_at = NOW();
`;

return {
  queryEmpresa,
  queryTokens,
  email,
  config
};
```

---

## ✅ Checklist de Implementação

- [ ] Configurar webhook no N8N para receber notificações do Kiwify
- [ ] Identificar qual campo do webhook contém o tipo de plano (mensal/semestral/anual)
- [ ] Criar nó no N8N para buscar empresa por email
- [ ] Criar nó para atualizar tabela `empresas` com novo plano
- [ ] Criar nó para adicionar/atualizar tokens na tabela `user_token_balance`
- [ ] Testar com pagamento de teste
- [ ] Implementar log de renovações (opcional)
- [ ] Adicionar tratamento de erros

---

## 🚨 Pontos de Atenção

1. **Tokens devem ACUMULAR**, não substituir:
   - ✅ `total_tokens = total_tokens + 100000`
   - ❌ `total_tokens = 100000`

2. **Usar `auth_user_id` da tabela `empresas`** para referenciar o usuário na tabela `user_token_balance`

3. **Status da assinatura:**
   - Trial → `'trial'`
   - Ativo → `'active'`
   - Cancelado → `'canceled'`
   - Expirado → `'expired'`

4. **Campo `available_tokens` é calculado automaticamente**, não precisa atualizar manualmente

5. **Sempre atualizar `updated_at = NOW()`** para manter rastreabilidade

---

## 📞 Teste Manual (Supabase SQL Editor)

```sql
-- Simular renovação mensal
UPDATE empresas
SET 
  subscription_status = 'active',
  subscription_plan = 'basic',
  subscription_period = '1month',
  subscription_renews_at = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE email = 'seu-email@teste.com';

-- Adicionar tokens (acumular)
UPDATE user_token_balance
SET 
  total_tokens = total_tokens + 100000,
  plan_type = 'basic',
  updated_at = NOW()
WHERE user_id = (SELECT auth_user_id FROM empresas WHERE email = 'seu-email@teste.com');
```

---

## 🎉 Resultado Final

Após executar as queries, o sistema deverá:

1. ✅ Atualizar status da assinatura para `'active'`
2. ✅ Definir o plano correto (`basic`, `pro` ou `enterprise`)
3. ✅ Configurar período correto (`1month`, `6months` ou `12months`)
4. ✅ Calcular próxima data de renovação
5. ✅ Acumular tokens ao saldo existente
6. ✅ Manter histórico de tokens usados intacto
