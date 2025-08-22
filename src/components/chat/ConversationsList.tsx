// List of conversations component
import React from 'react';
import { MessageSquare, Users, Eye, EyeOff, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conversation } from '@/types';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: () => void;
  loading?: boolean;
  className?: string;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  loading = false,
  className
}: ConversationsListProps) {
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.type === 'case') return `Case #${conversation.caseId}`;
    return 'General Chat';
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
          <Button size="sm" onClick={onCreateConversation}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div className="text-lg mb-2">No conversations yet</div>
            <div className="text-sm mb-4">Start chatting with your team and clients</div>
            <Button onClick={onCreateConversation}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Conversation
            </Button>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedConversationId === conversation.id && "bg-muted"
                )}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>
                        {conversation.type === 'case' ? 'C' : 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">
                        {getConversationTitle(conversation)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {conversation.type === 'case' && (
                          <Badge variant="secondary" className="text-xs py-0 px-1">
                            Case
                          </Badge>
                        )}
                        {conversation.isClientVisible ? (
                          <Badge variant="default" className="text-xs py-0 px-1 flex items-center gap-1">
                            <Eye className="h-2 w-2" />
                            Client
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs py-0 px-1 flex items-center gap-1">
                            <EyeOff className="h-2 w-2" />
                            Internal
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {conversation.participants?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {conversation.lastMessage ? 
                      formatLastMessageTime(conversation.updatedAt) : 
                      formatLastMessageTime(conversation.createdAt)
                    }
                  </div>
                </div>
                
                {conversation.lastMessage && (
                  <div className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                  </div>
                )}
                
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <div className="mt-2 flex justify-end">
                    <Badge variant="default" className="text-xs">
                      {conversation.unreadCount} new
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}