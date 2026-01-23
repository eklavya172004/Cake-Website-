'use client';

import { usePathname } from 'next/navigation';
import TopNavigation from '@/components/navigation/TopNavigation';

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navbar for admin and vendor dashboards (they have their own sidebars)
  if (pathname.startsWith('/admin') || pathname.startsWith('/vendor')) {
    return null;
  }

  return <TopNavigation />;
}
