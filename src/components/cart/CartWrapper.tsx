'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function CartWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide cart on vendor and admin dashboard routes
  const isVendorDashboard = pathname === '/vendor' || pathname.startsWith('/vendor/');
  const isAdminDashboard = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isVendorDashboard || isAdminDashboard) {
    return null;
  }

  return <>{children}</>;
}
