
// Case-specific chat interface that loads conversations for a case
import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './ChatInterface';
import { ConversationsList } from './ConversationsList';
import { CreateConversationDialog } from './CreateConversationDialog';
import { chatApi } from '@/lib/api/chatApi';
import { useAuth } from '@/components/auth/AuthProvider';
import { Conversation } from '@/types';

interface CaseChatInterfaceProps {
  caseId: string;
  className?: string;
}

export function CaseChatInterface({ caseId, className }: CaseChatInterfaceProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaseConversations();
  }, [caseId]);

  const loadCaseConversations = async () => {
    try {
      setLoading(true);
      const caseConversations = await chatApi.getCaseConversations(caseId);
      setConversations(caseConversations);
      
      // Auto-select the first conversation if available
      if (caseConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(caseConversations[0]);
      }
    } catch (error) {
      console.error('Failed to load case conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (request: any) => {
    try {
      const conversation = await chatApi.createConversation({
        ...request,
        type: 'case',
        caseId: caseId
      });
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation);
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to access chat.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a conversation about this case to communicate with team members and clients.
            </p>
            <CreateConversationDialog
              onCreateConversation={handleCreateConversation}
              caseId={caseId}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Case Conversations</h3>
              <CreateConversationDialog
                onCreateConversation={handleCreateConversation}
                caseId={caseId}
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            <ConversationsList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={setSelectedConversation}
              onCreateConversation={() => {}} // Not used since we're using the trigger approach
              loading={false}
              className="h-full"
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatInterface
                conversation={selectedConversation}
                currentUserId={user.id}
                className="h-full"
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
