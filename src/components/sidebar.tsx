'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Shirt,
  FolderOpen,
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
  { label: 'Collections', href: '/collections', icon: FolderOpen },
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
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">EDIT Admin</h1>
      </div>

      <Separator />

      {/* Admin Info */}
      {admin && (
        <div className="p-4">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <p className="text-sm font-medium text-gray-900 truncate">
              {admin.email}
            </p>
            <Badge
              variant={admin.role === 'super_admin' ? 'default' : 'secondary'}
              className="mt-2"
            >
              {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Navigation Sections */}
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="pt-4">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
