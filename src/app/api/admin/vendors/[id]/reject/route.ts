import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendorId = id;

    // Update both Vendor approval status and VendorProfile verification status
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        approvalStatus: 'rejected',
      },
    });

    // Also update the verification status in VendorProfile
    await prisma.vendorProfile.update({
      where: { vendorId },
      data: {
        verificationStatus: 'rejected',
        verifiedBy: 'admin',
      },
    });

    return NextResponse.json({
      message: 'Vendor rejected',
      vendor,
    });
  } catch (error) {
    console.error('Rejection error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
