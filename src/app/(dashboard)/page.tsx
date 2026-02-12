'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to users page as the default dashboard view
    router.replace('/users');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
