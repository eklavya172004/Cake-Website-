import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';

// Helper to wait for database connection
const waitForDb = async (maxAttempts = 3) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }
  return false;
};

export async function GET() {
  try {
    // Wait for database connection
    const dbReady = await waitForDb();
    if (!dbReady) {
      return NextResponse.json([], { status: 200 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor') {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 401 }
      );
    }

    // If vendor hasn't completed onboarding, return empty array
    if (!account.vendorId) {
      return NextResponse.json([]);
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

    return NextResponse.json(
      cakes.map((cake: any) => ({
        ...cake,
        basePrice: parseFloat(cake.basePrice.toString()),
      }))
    );
  } catch (error) {
    // Silently handle database connection errors during startup
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    
    // Return empty array during startup, with 200 status to not show errors to user
    if (errorMessage.includes('not yet connected')) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch cakes' },
      { status: 500 }
    );
  }
}
