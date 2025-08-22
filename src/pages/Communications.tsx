// Standalone communications page
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { CreateConversationDialog } from '@/components/chat/CreateConversationDialog';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/components/auth/AuthProvider';
import { Conversation } from '@/types';

export default function Communications() {
  const { user } = useAuth();
  const { conversations, loading, createConversation } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please log in to access the communications system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Communications</h1>
          <p className="text-muted-foreground mt-1">
            Chat with team members and clients
          </p>
        </div>
        <CreateConversationDialog onCreateConversation={createConversation} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <ConversationsList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={setSelectedConversation}
            onCreateConversation={() => {}} // Handled by dialog
            loading={loading}
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
              <div className="text-center space-y-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}