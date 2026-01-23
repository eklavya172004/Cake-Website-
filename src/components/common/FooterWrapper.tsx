'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer for admin and vendor dashboards
  if (pathname.startsWith('/admin') || pathname.startsWith('/vendor')) {
    return null;
  }

  return <Footer />;
}
