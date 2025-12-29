// src/app/cakes/[vendorId]/[slug]/page.tsx
import { prisma } from '@/lib/db/client';
import { notFound } from 'next/navigation';
import CakeDetailClient from './CakeDetailPage';

export const dynamic = 'force-dynamic'; // Use dynamic rendering

export default async function CakePage({ 
  params 
}: { 
  params: Promise<{ vendorId: string; slug: string }>
}) {
  const { vendorId, slug } = await params;
  
  const cake = await prisma.cake.findUnique({
    where: { vendorId_slug: { vendorId, slug } },
    include: {
      vendor: true
    }
  });

  if (!cake) {
    notFound();
  }

  return <CakeDetailClient cake={cake} />;
}
