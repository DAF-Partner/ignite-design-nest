// Professional Sidebar Navigation for B2B Debt Collection Platform
// Role-based navigation with professional design

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  CheckSquare,
  Shield,
  Settings,
  Building2,
  Scale,
  UserCheck,
  Archive,
  MessageSquare,
  User,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['CLIENT', 'AGENT', 'ADMIN', 'DPO'],
  },
  {
    title: 'Cases',
    url: '/cases',
    icon: FileText,
    roles: ['CLIENT', 'AGENT', 'ADMIN', 'DPO'],
  },
  {
    title: 'Approvals',
    url: '/approvals',
    icon: CheckSquare,
    roles: ['ADMIN', 'CLIENT'],
  },
  {
    title: 'Invoices',
    url: '/invoices',
    icon: CreditCard,
    roles: ['CLIENT', 'ADMIN'],
  },
  {
    title: 'GDPR Requests',
    url: '/gdpr-requests',
    icon: Shield,
    roles: ['CLIENT', 'DPO', 'ADMIN'],
  },
  {
    title: 'Communications',
    url: '/communications',
    icon: MessageSquare,
    roles: ['CLIENT', 'AGENT', 'ADMIN', 'DPO'],
  },
];

const userItems = [
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
    roles: ['CLIENT', 'AGENT', 'ADMIN', 'DPO'],
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    roles: ['CLIENT', 'AGENT', 'ADMIN', 'DPO'],
  },
];

const adminItems = [
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Tariffs',
    url: '/admin/tariffs',
    icon: Scale,
    roles: ['ADMIN'],
  },
  {
    title: 'Templates',
    url: '/admin/templates',
    icon: MessageSquare,
    roles: ['ADMIN'],
  },
  {
    title: 'Retention Policy',
    url: '/admin/retention',
    icon: Archive,
    roles: ['ADMIN'],
  },
];

const dpoItems = [
  {
    title: 'DPO Dashboard',
    url: '/dpo',
    icon: UserCheck,
    roles: ['DPO'],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, hasRole } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClasses = (path: string) =>
    cn(
      'w-full justify-start transition-colors',
      isActive(path)
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'hover:bg-accent hover:text-accent-foreground'
    );

  const filteredMainItems = navigationItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

  const filteredAdminItems = adminItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

  const filteredDpoItems = dpoItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

  const filteredUserItems = userItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'}>
      <SidebarContent className="gap-0">
        {/* Company Branding */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">
                  {t('collectPro')}
                </h1>
                <p className="text-xs text-sidebar-foreground/60">
                  {t('debtCollectionPlatform')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wide">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('administration')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* DPO Section */}
        {filteredDpoItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('dataProtection')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredDpoItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Section */}
        {filteredUserItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('account')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredUserItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}