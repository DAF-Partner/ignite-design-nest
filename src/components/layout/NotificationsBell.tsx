// Professional Notifications Bell Component
// Real-time notifications for debt collection platform

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Notification, NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'case_update',
    title: 'Case Status Updated',
    message: 'Case #12345 has moved to Legal Stage',
    relatedEntityId: '12345',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    actionUrl: '/cases/12345',
  },
  {
    id: '2',
    type: 'approval_required',
    title: 'Approval Required',
    message: 'Legal escalation approval needed for Case #12346',
    relatedEntityId: '2',
    relatedEntityType: 'approval',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    actionUrl: '/approvals',
  },
  {
    id: '3',
    type: 'payment_due',
    title: 'Invoice Overdue',
    message: 'Invoice #INV-2024-001 is now overdue',
    relatedEntityId: '1',
    relatedEntityType: 'invoice',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    actionUrl: '/invoices/1',
  },
];

const notificationIcons: Record<NotificationType, React.ElementType> = {
  case_update: FileText,
  approval_required: AlertCircle,
  document_uploaded: FileText,
  payment_due: CreditCard,
};

const notificationColors: Record<NotificationType, string> = {
  case_update: 'text-info',
  approval_required: 'text-warning',
  document_uploaded: 'text-accent',
  payment_due: 'text-destructive',
};

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, readAt: now }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-10 w-10 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="p-0 font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const isUnread = !notification.readAt;
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 border-l-2 hover:bg-accent/50 cursor-pointer transition-colors',
                    isUnread
                      ? 'border-l-primary bg-primary/5'
                      : 'border-l-transparent'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('mt-0.5', notificationColors[notification.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          isUnread && 'text-foreground'
                        )}>
                          {notification.title}
                        </p>
                        {isUnread && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-sm"
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}