import { NextRequest, NextResponse } from 'next/server';
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
    // Wait for database connection
    const dbReady = await waitForDb();
    if (!dbReady) {
      return NextResponse.json(
        { message: 'Database connection unavailable' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendorId = (session.user as any).vendorId;

    if (!vendorId) {
      return NextResponse.json(
        { message: 'No vendor found in session' },
        { status: 404 }
      );
    }

    // Get vendor status first (this is essential)
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { 
        approvalStatus: true, 
        createdAt: true,
        deliveryFee: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get vendor profile - may or may not exist yet
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { vendorId },
    });

    const serviceAreas = await prisma.vendorServiceArea.findMany({
      where: { vendorId },
    });

    // Format service areas to match frontend expectations
    const formattedServiceAreas = serviceAreas.map((area) => ({
      location: area.areaName,
      pincodes: area.pincode,
      deliveryFee: area.deliveryFee,
      operatingHours: {
        start: '08:00',
        end: '22:00',
      },
    }));

    return NextResponse.json({
      status: vendor.approvalStatus || 'pending',
      submittedAt: vendor.createdAt || new Date(),
      businessName: vendorProfile?.businessName || '',
      businessType: vendorProfile?.businessType || '',
      businessRegistration: vendorProfile?.businessRegistration || '',
      gstNumber: vendorProfile?.gstNumber || '',
      panNumber: vendorProfile?.panNumber || '',
      ownerName: vendorProfile?.ownerName || '',
      ownerPhone: vendorProfile?.ownerPhone || '',
      ownerEmail: vendorProfile?.ownerEmail || '',
      bankAccountNumber: vendorProfile?.bankAccountNumber || '',
      bankIfscCode: vendorProfile?.bankIfscCode || '',
      bankAccountHolderName: vendorProfile?.bankAccountHolderName || '',
      deliveryFee: vendor.deliveryFee || 50,
      serviceAreas: formattedServiceAreas,
    });
  } catch (error) {
    // Silently handle database connection errors during startup
    // These are logged internally by Prisma and don't need console output
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    
    // Return 503 for connection errors, 500 for other errors
    const status = errorMessage.includes('not yet connected') ? 503 : 500;
    
    return NextResponse.json(
      { message: 'Service temporarily unavailable' },
      { status }
    );
  }
}
