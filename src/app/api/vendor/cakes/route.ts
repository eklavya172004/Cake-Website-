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

    // Get vendor's cakes
    const cakes = await prisma.cake.findMany({
      where: { vendorId: account.vendorId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        basePrice: true,
        description: true,
        images: true,
        flavors: true,
        customOptions: true,
        isActive: true,
        isCustomizable: true,
        availableSizes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(cakes);
  } catch (error) {
    console.error('Vendor cakes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cakes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
