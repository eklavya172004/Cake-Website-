import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    
    const vendors = await prisma.vendor.findMany({
      where: {
        isActive: true,
        ...(pincode && {
          serviceAreas: {
            has: pincode
          }
        })
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        rating: true,
        totalReviews: true,
        serviceAreas: true,
        deliveryFee: true,
        preparationTime: true,
        isActive: true,
      },
      orderBy: {
        rating: 'desc'
      }
    });
    
    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}