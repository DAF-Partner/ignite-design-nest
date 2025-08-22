// Custom hook for chat functionality
import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '@/lib/api/chatApi';
import { Conversation, ChatMessage, CreateConversationRequest, CreateMessageRequest } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create conversation
  const createConversation = useCallback(async (request: CreateConversationRequest) => {
    try {
      const conversation = await chatApi.createConversation(request);
      setConversations(prev => [conversation, ...prev]);
      toast({
        title: 'Success',
        description: 'Conversation created successfully'
      });
      return conversation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create conversation';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      throw err;
    }
  }, [toast]);

  // Send message
  const sendMessage = useCallback(async (request: CreateMessageRequest) => {
    try {
      const message = await chatApi.sendMessage(request);
      // Update conversation timestamp in local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === request.conversationId
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        )
      );
      return message;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      throw err;
    }
  }, [toast]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Subscribe to conversation updates
  useEffect(() => {
    const channel = chatApi.subscribeToConversations((conversation) => {
      setConversations(prev => {
        const existing = prev.find(c => c.id === conversation.id);
        if (existing) {
          return prev.map(c => c.id === conversation.id ? { ...c, ...conversation } : c);
        } else {
          return [conversation, ...prev];
        }
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    conversations,
    loading,
    error,
    createConversation,
    sendMessage,
    refreshConversations: loadConversations
  };
}

export function useConversation(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const data = await chatApi.getMessages(conversationId);
      setMessages(data);
      // Mark as read
      await chatApi.markAsRead(conversationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, toast]);

  // Send message
  const sendMessage = useCallback(async (content: string, isInternal = false) => {
    if (!conversationId || !content.trim()) return;

    try {
      const message = await chatApi.sendMessage({
        conversationId,
        content: content.trim(),
        isInternal
      });
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      throw err;
    }
  }, [conversationId, toast]);

  // Load messages on mount or conversation change
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = chatApi.subscribeToMessages(conversationId, (message) => {
      setMessages(prev => [...prev, message]);
      // Auto-mark as read when receiving messages
      chatApi.markAsRead(conversationId);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages: loadMessages
  };
}