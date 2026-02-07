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
        { submittedStatus: false, message: 'Database connection unavailable' },
        { status: 200 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { submittedStatus: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendorId = (session.user as any).vendorId;

    // If vendor doesn't have a vendorId yet, they haven't started onboarding
    if (!vendorId) {
      return NextResponse.json(
        { submittedStatus: false, message: 'Onboarding not started' },
        { status: 200 }
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
        { submittedStatus: false, message: 'Vendor onboarding not found' },
        { status: 200 }
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
    const formattedServiceAreas = serviceAreas.map((area: any) => ({
      location: area.areaName,
      pincodes: area.pincode,
      deliveryFee: area.deliveryFee,
      operatingHours: {
        start: '08:00',
        end: '22:00',
      },
    }));

    return NextResponse.json({
      submittedStatus: true,
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
    
    // Return 200 with clear status indicating onboarding hasn't been submitted
    return NextResponse.json(
      { submittedStatus: false, message: 'Service temporarily unavailable' },
      { status: 200 }
    );
  }
}
