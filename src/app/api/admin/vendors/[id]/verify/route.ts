import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendorId = id;
    const body = await request.json();
    const { action, notes } = body; // action: 'verify' or 'reject'

    if (!action || !['verify', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "verify" or "reject"' },
        { status: 400 }
      );
    }

    // Update the verification status in VendorProfile
    const updatedProfile = await prisma.vendorProfile.update({
      where: { vendorId },
      data: {
        verificationStatus: action === 'verify' ? 'verified' : 'rejected',
        verifiedAt: action === 'verify' ? new Date() : undefined,
        verifiedBy: 'admin',
        verificationNotes: notes || undefined,
      },
    });

    return NextResponse.json({
      message: `Vendor ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Verification update error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
