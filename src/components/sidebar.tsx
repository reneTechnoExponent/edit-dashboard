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
  FileEdit,
  LogOut,
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
  { label: 'CMS', href: '/cms', icon: FileEdit },
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
      <nav className="flex-1 space-y-1 px-3 py-4">
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
