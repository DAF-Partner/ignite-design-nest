// Dialog for creating new conversations
import React, { useState } from 'react';
import { Plus, Users, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreateConversationRequest, ConversationType, Conversation } from '@/types';

interface CreateConversationDialogProps {
  onCreateConversation: (request: CreateConversationRequest) => Promise<Conversation>;
  caseId?: string;
  trigger?: React.ReactNode;
}

export function CreateConversationDialog({ 
  onCreateConversation, 
  caseId,
  trigger 
}: CreateConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ConversationType>(caseId ? 'case' : 'general');
  const [isClientVisible, setIsClientVisible] = useState(false);
  const [participantEmails, setParticipantEmails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      
      // Parse participant emails (in real app, this would validate against user database)
      const participantIds = participantEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const request: CreateConversationRequest = {
        title: title.trim(),
        type,
        caseId: type === 'case' ? caseId : undefined,
        isClientVisible,
        participantIds
      };

      await onCreateConversation(request);
      
      // Reset form
      setTitle('');
      setType(caseId ? 'case' : 'general');
      setIsClientVisible(false);
      setParticipantEmails('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-1" />
      New Chat
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Conversation</DialogTitle>
            <DialogDescription>
              Start a new conversation with team members and clients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Conversation Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter conversation title..."
                required
              />
            </div>

            <div className="grid gap-3">
              <Label>Conversation Type</Label>
              <RadioGroup 
                value={type} 
                onValueChange={(value) => setType(value as ConversationType)}
                disabled={!!caseId} // Lock to case type if caseId provided
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general">General Chat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="case" id="case" />
                  <Label htmlFor="case" className="flex items-center gap-2">
                    Case Discussion
                    {caseId && (
                      <Badge variant="secondary" className="text-xs">
                        #{caseId}
                      </Badge>
                    )}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="client-visible" className="text-base">
                  Client Visibility
                </Label>
                <div className="text-sm text-muted-foreground">
                  Allow clients to see this conversation
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isClientVisible ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Visible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <EyeOff className="h-3 w-3" />
                    Internal
                  </Badge>
                )}
                <Switch
                  id="client-visible"
                  checked={isClientVisible}
                  onCheckedChange={setIsClientVisible}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="participants">Participants (Email addresses)</Label>
              <Textarea
                id="participants"
                value={participantEmails}
                onChange={(e) => setParticipantEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas..."
                className="min-h-[80px]"
              />
              <div className="text-xs text-muted-foreground">
                Separate multiple email addresses with commas
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Creating...' : 'Create Conversation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}