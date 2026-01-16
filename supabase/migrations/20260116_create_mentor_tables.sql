-- Migration: Criar tabelas para Mentor IA
-- Created at: 2026-01-16

-- Tabela de conversas do Mentor IA
CREATE TABLE IF NOT EXISTS public.mentor_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens do Mentor IA
CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de uso de tokens do Mentor IA
CREATE TABLE IF NOT EXISTS public.mentor_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mentor_conversations_user_id ON public.mentor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_conversation_id ON public.mentor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mentor_usage_user_date ON public.mentor_usage(user_id, date);

-- Row Level Security (RLS)
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_usage ENABLE ROW LEVEL SECURITY;

-- Policies para mentor_conversations
CREATE POLICY "Users can view own conversations"
  ON public.mentor_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.mentor_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.mentor_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.mentor_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para mentor_messages
CREATE POLICY "Users can view messages from own conversations"
  ON public.mentor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_conversations
      WHERE id = mentor_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON public.mentor_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentor_conversations
      WHERE id = mentor_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Policies para mentor_usage
CREATE POLICY "Users can view own usage"
  ON public.mentor_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.mentor_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.mentor_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em mentor_conversations
CREATE TRIGGER update_mentor_conversations_updated_at
  BEFORE UPDATE ON public.mentor_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
