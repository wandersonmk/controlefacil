import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  try {
    // Obter configuração do runtime
    const config = useRuntimeConfig()
    
    // Obter token de autenticação
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Criar cliente Supabase com token do usuário
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    // Obter body da requisição
    const body = await readBody(event)
    const { conversationId, message } = body

    if (!message || !message.trim()) {
      throw createError({
        statusCode: 400,
        message: 'Mensagem não pode estar vazia'
      })
    }
    
    // Verificar/criar conversa
    let conversation
    if (conversationId) {
      const { data, error } = await supabase
        .from('mentor_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()
      
      if (error || !data) {
        throw createError({
          statusCode: 404,
          message: 'Conversa não encontrada'
        })
      }
      conversation = data
    } else {
      // Criar nova conversa com título baseado na primeira mensagem
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '')
      const { data, error } = await supabase
        .from('mentor_conversations')
        .insert({
          user_id: user.id,
          title
        })
        .select()
        .single()
      
      if (error || !data) {
        throw createError({
          statusCode: 500,
          message: 'Erro ao criar conversa'
        })
      }
      conversation = data
    }

    // Verificar saldo de tokens antes de processar
    const { data: tokenBalance } = await supabase
      .from('user_token_balance')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const availableTokens = tokenBalance 
      ? (tokenBalance.total_tokens - tokenBalance.used_tokens) 
      : 0

    if (availableTokens <= 0) {
      throw createError({
        statusCode: 403,
        message: 'Tokens insuficientes. Aguarde a renovação mensal ou adquira tokens extras.'
      })
    }

    // Buscar histórico de mensagens da conversa
    const { data: historyMessages } = await supabase
      .from('mentor_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20) // Limitar últimas 20 mensagens

    // Salvar mensagem do usuário
    await supabase
      .from('mentor_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        tokens_used: 0
      })

    // Configurar OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Preparar mensagens para API
    const messages: any[] = [
      {
        role: 'system',
        content: 'Você é o meu Mentor de IA e trabalha para a Precify.\nSeu objetivo é ajudar a precificar produtos, calcular custos, analisar lucro ou prejuízo e apoiar a tomada de decisões melhores no negócio.\n\nVocê é especialista em negócios de alimentação, principalmente:\n- Açaíterias\n- Sorveterias\n- Pastelarias\n- Hamburguerias\n- Pizzarias\n\n---------------------------------\nCOMO VOCÊ DEVE RESPONDER:\n\n- Seja direto e humano\n- Use respostas curtas e práticas\n- Vá direto ao ponto (não dê aula)\n- Use emojis com moderação (💰 📉 📈 ⚠️ ✅)\n- Destaque palavras importantes em **negrito** (Markdown)\n- Sempre comece pela **conclusão**\n- Evite explicações longas ou teóricas\n- Não deixe tudo “grudado”: quando mudar de assunto, pule uma linha\n\n---------------------------------\nFORMATO PADRÃO DA RESPOSTA:\n\n1️⃣ Conclusão clara (lucro ou prejuízo)\n2️⃣ Cálculo resumido (1 ou 2 linhas)\n3️⃣ Alerta rápido sobre custos adicionais\n4️⃣ Pergunta objetiva para avançar no cálculo, se necessário\n5️⃣ Próximo passo prático (o que fazer agora)\n\n---------------------------------\nCOMO TRATAR CÁLCULOS:\n\n- Nunca invente valores\n- Quando faltar informação, pergunte apenas o essencial\n- Se o usuário mencionar complementos, embalagem ou outros custos:\n  - Informe que eles impactam o lucro\n  - Pergunte claramente se ele deseja ajuda para somar o custo total\n- Se possível, sugira:\n  - Preço ideal\n  - Margem segura\n- Diga claramente se a margem é:\n  - **Segura**\n  - **Apertada**\n  - Ou se há **Prejuízo**\n\n---------------------------------\nIMPORTANTE:\n\n- Não sugira links\n\n---------------------------------\nEXEMPLO DE TOM ESPERADO:\n\n"💰 **Não há prejuízo nesse valor.**\n\nSe você pagou **R$ 115 em 10 litros**, o litro sai por **R$ 11,50**.\nUm copo de **750 ml custa cerca de R$ 8,60** de açaí.\n\nVendendo a **R$ 25,00**, a margem é **segura** ✅\n⚠️ Lembre de somar complementos e embalagem.\n\n👉 Quer que eu te ajude a calcular o custo total com esses itens?"\n\n---------------------------------\nSOBRE SOMAS E CONTAS:\n\n- Quando o usuário pedir para somar algo:\n  - Pergunte os valores que faltam\n  - Guie o cálculo até o resultado final\n  - Mostre o valor final de forma clara e objetiva\n- Sempre explique o mínimo necessário\n\n---------------------------------\nSEU FOCO PRINCIPAL:\n\n👉 Ajudar a **ganhar dinheiro**\n👉 Evitar **prejuízo**\n👉 Ajudar a **precificar certo**\n👉 Ajudar a **criar combos lucrativos**\n👉 Falar como um **mentor de balcão**, não como professor\n\n---------------------------------\nNÃO FAÇA:\n\n- Não dê aulas longas\n- Não explique teoria\n- Não seja genérico\n- Não escreva textos grandes\n\n---------------------------------\nFINALIZAÇÃO PADRÃO (quando fizer sentido):\n\n"Se quiser, posso te ajudar a somar os custos ou ajustar o preço para melhorar sua margem 😉"'
      }
    ]

    // Adicionar histórico
    if (historyMessages && historyMessages.length > 0) {
      messages.push(...historyMessages)
    }

    // Adicionar mensagem atual
    messages.push({
      role: 'user',
      content: message
    })

    // Chamar API da OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
      temperature: 0.6,
      max_tokens: 500
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.'
    const tokensUsed = completion.usage?.total_tokens || 0

    // Salvar resposta do assistente
    await supabase
      .from('mentor_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: assistantMessage,
        tokens_used: tokensUsed
      })

    // Atualizar uso de tokens do dia
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await supabase
      .from('mentor_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (usageData) {
      await supabase
        .from('mentor_usage')
        .update({
          tokens_used: usageData.tokens_used + tokensUsed
        })
        .eq('id', usageData.id)
    } else {
      await supabase
        .from('mentor_usage')
        .insert({
          user_id: user.id,
          tokens_used: tokensUsed,
          date: today
        })
    }

    // Atualizar saldo de tokens do usuário (descontar tokens usados)
    const { data: userTokenBalance } = await supabase
      .from('user_token_balance')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (userTokenBalance) {
      await supabase
        .from('user_token_balance')
        .update({
          used_tokens: userTokenBalance.used_tokens + tokensUsed
        })
        .eq('user_id', user.id)
    } else {
      // Criar registro se não existir
      await supabase
        .from('user_token_balance')
        .insert({
          user_id: user.id,
          total_tokens: 10000,
          used_tokens: tokensUsed,
          plan_type: 'free'
        })
    }

    // Atualizar timestamp da conversa
    await supabase
      .from('mentor_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id)

    return {
      success: true,
      conversationId: conversation.id,
      message: assistantMessage,
      tokensUsed
    }

  } catch (error: any) {
    console.error('Erro no chat do mentor:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao processar mensagem'
    })
  }
})
