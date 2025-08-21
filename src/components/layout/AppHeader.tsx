// Professional Application Header for B2B Debt Collection Platform
// Header with navigation, notifications, and user menu

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Settings } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslation } from '@/contexts/TranslationContext';
import { NotificationsBell } from './NotificationsBell';

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const pageNames: Record<string, string> = {
    '/dashboard': t('dashboard'),
    '/cases': t('caseManagement'),
    '/cases/new': t('newCase'),
    '/approvals': t('approvals'),
    '/invoices': t('invoices'),
    '/gdpr': t('gdprRequests'),
    '/profile': t('profile'),
    '/settings': t('settings'),
    '/admin/users': t('userManagement'),
    '/admin/tariffs': t('tariffManagement'),
    '/admin/templates': t('messageTemplates'),
    '/admin/retention': t('retentionPolicy'),
    '/dpo': t('dataProtectionOffice'),
  };

  const getPageName = () => {
    // Check for exact matches first
    if (pageNames[location.pathname]) {
      return pageNames[location.pathname];
    }

    // Check for partial matches
    for (const [path, name] of Object.entries(pageNames)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        return name;
      }
    }

    // Default fallback
    return 'CollectPro';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Sidebar trigger and page title */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {getPageName()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.role && (
                <span className="capitalize">
                  {user.role.toLowerCase().replace('_', ' ')} Dashboard
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationsBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground uppercase">
                    {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                {t('profile')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}