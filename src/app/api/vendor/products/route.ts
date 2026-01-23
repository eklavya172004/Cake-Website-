import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor' || !account.vendorId) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 401 }
      );
    }

    // Get vendor with cakes
    const vendor = await prisma.vendor.findUnique({
      where: { id: account.vendorId },
      include: { cakes: true },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Count reviews for each cake
    const products = await Promise.all(
      vendor.cakes.map(async (cake) => {
        const reviewCount = await prisma.cakeReview.count({
          where: { cakeId: cake.id },
        });

        return {
          id: cake.id,
          name: cake.name,
          category: cake.category,
          basePrice: cake.basePrice,
          popularity: 0,
          rating: 4.5,
          status: 'active' as const,
        };
      })
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Vendor products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
