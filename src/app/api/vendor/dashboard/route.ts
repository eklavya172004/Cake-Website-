import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';

// Helper to wait for database connection
const waitForDb = async (maxAttempts = 5) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  return false;
};

export async function GET(request: NextRequest) {
  try {
    // Wait for database to be ready
    const dbReady = await waitForDb();
    if (!dbReady) {
      return NextResponse.json({
        todayOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        rating: 0,
        completionRate: 0,
        pendingOrders: 0,
        totalProducts: 0,
        onboardingStatus: 'pending',
        approvalStatus: 'pending',
      });
    }

    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from Account table using a more flexible approach
    let account;
    try {
      account = await prisma.account.findFirst({
        where: { email: session.user.email },
      });
    } catch (dbError) {
      console.error('Error finding account:', dbError);
      // Return default data if database query fails
      return NextResponse.json({
        todayOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        rating: 0,
        completionRate: 0,
        pendingOrders: 0,
        totalProducts: 0,
        onboardingStatus: 'pending',
        approvalStatus: 'pending',
      });
    }

    // If no account found or not a vendor, return default data
    if (!account || account.role !== 'vendor') {
      return NextResponse.json({
        todayOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        rating: 0,
        completionRate: 0,
        pendingOrders: 0,
        totalProducts: 0,
        onboardingStatus: 'pending',
        approvalStatus: 'pending',
      });
    }

    // If vendor hasn't completed onboarding yet, return default data
    if (!account.vendorId) {
      return NextResponse.json({
        todayOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        rating: 0,
        completionRate: 0,
        pendingOrders: 0,
        totalProducts: 0,
        onboardingStatus: 'pending',
        approvalStatus: 'pending',
      });
    }

    // Get vendor details
    let vendor;
    console.log('📊 Dashboard API - Fetching vendor:', { 
      accountVendorId: account.vendorId, 
      accountEmail: account.email,
      accountRole: account.role 
    });
    try {
      vendor = await prisma.vendor.findUnique({
        where: { id: account.vendorId },
        include: {
          orders: {
            select: {
              id: true,
              createdAt: true,
              status: true,
              finalAmount: true,
            },
          },
          cakes: {
            select: { id: true },
          },
          profile: {
            select: { vendorId: true },
          },
        },
      });
    } catch (dbError) {
      console.error('Error finding vendor:', dbError);
      // Return default data if vendor lookup fails
      return NextResponse.json({
        todayOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        rating: 0,
        completionRate: 0,
        pendingOrders: 0,
        totalProducts: 0,
        onboardingStatus: 'pending',
        approvalStatus: 'pending',
      });
    }

    if (!vendor) {
      console.log('❌ Vendor not found for ID:', account.vendorId);
      return NextResponse.json({
        todayOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        rating: 0,
        completionRate: 0,
        pendingOrders: 0,
        totalProducts: 0,
        onboardingStatus: 'pending',
        approvalStatus: 'pending',
      });
    }

    console.log('✅ Vendor found:', { 
      vendorId: vendor.id,
      vendorName: vendor.name,
      hasProfile: !!vendor.profile,
      approvalStatus: vendor.approvalStatus,
      approvalStatusType: typeof vendor.approvalStatus,
    });

    const today = new Date().toDateString();
    const todayOrders = (vendor.orders || []).filter(
      (o: any) => new Date(o.createdAt).toDateString() === today
    );

    const todayRevenue = todayOrders.reduce(
      (sum: number, o: any) => sum + (o.finalAmount || 0),
      0
    );
    const totalRevenue = (vendor.orders || []).reduce(
      (sum: number, o: any) => sum + (o.finalAmount || 0),
      0
    );
    const completionRate = (vendor.orders || []).length
      ? Math.round(
          (((vendor.orders || []).filter((o: any) => o.status === 'delivered').length /
            (vendor.orders || []).length) *
            100)
        )
      : 0;
    const pendingOrders = (vendor.orders || []).filter(
      (o: any) => o.status === 'pending' || o.status === 'processing'
    ).length;

    return NextResponse.json({
      todayOrders: todayOrders.length,
      todayRevenue: Math.round(todayRevenue),
      totalRevenue: Math.round(totalRevenue),
      rating: vendor.rating || 0,
      completionRate,
      pendingOrders,
      totalProducts: (vendor.cakes || []).length,
      onboardingStatus: vendor.profile ? 'completed' : 'pending',
      approvalStatus: vendor.approvalStatus || 'pending',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    // Return default data instead of error to prevent user confusion
    return NextResponse.json({
      todayOrders: 0,
      todayRevenue: 0,
      totalRevenue: 0,
      rating: 0,
      completionRate: 0,
      pendingOrders: 0,
      totalProducts: 0,
      onboardingStatus: 'pending',
      approvalStatus: 'pending',
    });
  }
}
