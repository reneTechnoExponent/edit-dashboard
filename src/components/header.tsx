'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.admin);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>

        {admin && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{admin.email}</p>
              <Badge
                variant={admin.role === 'super_admin' ? 'default' : 'secondary'}
                className="mt-1"
              >
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
