'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Shirt,
  CreditCard,
  Activity,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  Layers,
  Tag,
  ListChecks,
  GitBranch,
  Award,
  Hash,
  Mail,
  Workflow,
  MailSearch,
  Send,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: 'super_admin';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Clothing Items', href: '/clothing', icon: Shirt },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  {
    label: 'System Monitor',
    href: '/system',
    icon: Activity,
    requiredRole: 'super_admin',
  },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  {
    label: 'Audit Logs',
    href: '/audit-logs',
    icon: FileText,
    requiredRole: 'super_admin',
  },
];

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Monitoring',
    items: [
      { label: 'Ingestion Monitor', href: '/ingestion', icon: Workflow },
      { label: 'Email Logs', href: '/email-logs', icon: MailSearch },
      { label: 'Send Push Notification', href: '/push-notifications', icon: Send },
      { label: 'LLM Usage & Costs', href: '/llm-usage', icon: DollarSign },
    ],
  },
  {
    title: 'Taxonomy',
    items: [
      { label: 'Clothing Menus', href: '/taxonomy/clothing-menus', icon: Menu },
      { label: 'Subcategories', href: '/taxonomy/subcategories', icon: Layers },
      { label: 'Attributes', href: '/taxonomy/attributes', icon: Tag },
      { label: 'Attribute Values', href: '/taxonomy/attribute-values', icon: ListChecks },
      { label: 'Subcategory Attributes', href: '/taxonomy/subcategory-attributes', icon: GitBranch },
      { label: 'Brands', href: '/taxonomy/brands', icon: Award },
      { label: 'Tags', href: '/taxonomy/tags', icon: Hash },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'CMS', href: '/cms', icon: FileText },
      { label: 'Email Templates', href: '/content/email-templates', icon: Mail },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.admin);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync initial state from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {
        // Ignore localStorage access errors
      }
      return next;
    });
  };

  // Filter nav items based on admin role
  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredRole) return true;
    return admin?.role === item.requiredRole;
  });

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out select-none shrink-0',
        isCollapsed ? 'w-18' : 'w-64'
      )}
      aria-label="Sidebar Navigation"
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-16 items-center border-b px-3',
          isCollapsed ? 'justify-center' : 'justify-between px-4'
        )}
      >
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tight text-gray-900 truncate">
            EDIT Admin
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-200"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Admin Info */}
      {admin && (
        <div className={cn('p-2', !isCollapsed && 'p-4')}>
          {isCollapsed ? (
            <div
              className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200 text-xs font-bold text-gray-800 uppercase"
              title={`${admin.email} (${admin.role === 'super_admin' ? 'Super Admin' : 'Admin'})`}
            >
              {admin.email?.charAt(0) || 'A'}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-3 shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate" title={admin.email}>
                {admin.email}
              </p>
              <Badge
                variant={admin.role === 'super_admin' ? 'default' : 'secondary'}
                className="mt-2"
              >
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto overflow-x-hidden">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                isCollapsed
                  ? 'justify-center h-10 w-10 mx-auto p-0'
                  : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Navigation Sections */}
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="pt-3">
            {isCollapsed ? (
              <Separator className="my-2 mx-auto w-6 bg-gray-200" />
            ) : (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    aria-label={item.label}
                    className={cn(
                      'flex items-center rounded-lg text-sm font-medium transition-colors',
                      isCollapsed
                        ? 'justify-center h-10 w-10 mx-auto p-0'
                        : 'gap-3 px-3 py-2',
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className={cn('p-2', !isCollapsed && 'p-4')}>
        {isCollapsed ? (
          <Button
            onClick={handleLogout}
            variant="outline"
            size="icon"
            className="h-10 w-10 mx-auto flex items-center justify-center text-gray-700 hover:text-red-600 hover:bg-red-50"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
