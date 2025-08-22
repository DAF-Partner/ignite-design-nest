-- Create chat system tables
-- 1. Conversations table (for both case-related and general chats)
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('case', 'general')),
  case_id TEXT, -- References case ID when type = 'case'
  is_client_visible BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Conversation participants table
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- 3. Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
    AND cp.user_id = auth.uid()::text
  )
  OR get_current_user_role() = 'ADMIN'
);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND created_by = auth.uid()::text
);

CREATE POLICY "Conversation creators and admins can update conversations"
ON public.conversations FOR UPDATE
USING (
  created_by = auth.uid()::text
  OR get_current_user_role() = 'ADMIN'
);

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()::text
  )
  OR get_current_user_role() = 'ADMIN'
);

CREATE POLICY "Users can join conversations"
ON public.conversation_participants FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()::text
);

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants FOR UPDATE
USING (user_id = auth.uid()::text);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()::text
  )
  OR get_current_user_role() = 'ADMIN'
);

CREATE POLICY "Conversation participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND sender_id = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()::text
  )
);

CREATE POLICY "Senders and admins can update their messages"
ON public.messages FOR UPDATE
USING (
  sender_id = auth.uid()::text
  OR get_current_user_role() = 'ADMIN'
);

-- Create indexes for performance
CREATE INDEX idx_conversations_case_id ON public.conversations(case_id);
CREATE INDEX idx_conversations_type ON public.conversations(type);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Create function to update updated_at timestamps
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime subscriptions for chat functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;