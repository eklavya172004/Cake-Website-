import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, ensureDatabaseConnection } from '@/lib/db/client';

export async function GET() {
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      
      // Ensure database connection
      const isConnected = await ensureDatabaseConnection(1, 500);
      if (!isConnected) {
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return NextResponse.json(
          { error: 'Database connection unavailable' },
          { status: 503 }
        );
      }

      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const account = await db.account.findUnique({
        where: { email: session.user.email! },
      });

      if (!account || account.role !== 'vendor' || !account.vendorId) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 401 }
        );
      }

      // Get vendor with cakes
      const vendor = await db.vendor.findUnique({
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
          const reviewCount = await db.cakeReview.count({
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
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch products';
      
      // Retry on specific database errors
      if (errorMessage.includes('Engine') && attempt < maxAttempts) {
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      console.error('Vendor products error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Database connection failed after multiple attempts' },
    { status: 503 }
  );
}
