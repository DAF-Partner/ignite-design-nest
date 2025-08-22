// Main chat interface component
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Eye, EyeOff, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useConversation } from '@/hooks/useChat';
import { ChatMessage, Conversation } from '@/types';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  conversation: Conversation;
  currentUserId: string;
  className?: string;
}

export function ChatInterface({ conversation, currentUserId, className }: ChatInterfaceProps) {
  const { messages, loading, sendMessage } = useConversation(conversation.id);
  const [messageInput, setMessageInput] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      await sendMessage(messageInput, isInternal);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageBubbleClass = (message: ChatMessage) => {
    const isOwn = message.senderId === currentUserId;
    const baseClass = "max-w-[70%] p-3 rounded-lg";
    
    if (message.messageType === 'system') {
      return "w-full text-center text-sm text-muted-foreground bg-muted/50 p-2 rounded";
    }
    
    if (isOwn) {
      return cn(baseClass, "ml-auto bg-primary text-primary-foreground");
    } else {
      return cn(baseClass, "mr-auto bg-muted");
    }
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              {conversation.title || 
                (conversation.type === 'case' ? `Case Discussion` : 'General Chat')
              }
            </CardTitle>
            {conversation.type === 'case' && (
              <Badge variant="secondary">Case #{conversation.caseId}</Badge>
            )}
            {conversation.isClientVisible ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Client Visible
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                Internal Only
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4" />
              {conversation.participants?.length || 0}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <div className="text-lg mb-2">No messages yet</div>
              <div className="text-sm">Start the conversation by sending a message below.</div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className={getMessageBubbleClass(message)}>
                  {message.messageType !== 'system' && (
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {message.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{message.senderName}</span>
                        {message.isInternal && (
                          <Badge variant="secondary" className="text-xs py-0 px-1">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs opacity-70">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={message.messageType === 'system' ? '' : 'text-sm'}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <Separator />
        
        {/* Message Input */}
        <div className="p-4">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="internal-message"
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                />
                <Label htmlFor="internal-message" className="text-sm">
                  Internal message (not visible to client)
                </Label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={loading || !messageInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}