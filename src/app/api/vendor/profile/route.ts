import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendorId = (session.user as { vendorId?: string })?.vendorId;

    if (!vendorId) {
      return NextResponse.json(
        { message: 'Vendor ID not found' },
        { status: 400 }
      );
    }

    const profile = await prisma.vendorProfile.findUnique({
      where: { vendorId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logo: true,
            approvalStatus: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendorId = (session.user as { vendorId?: string })?.vendorId;

    if (!vendorId) {
      return NextResponse.json(
        { message: 'Vendor ID not found' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'businessName',
      'businessType',
      'ownerName',
      'ownerPhone',
      'ownerEmail',
      'bankAccountNumber',
      'bankIfscCode',
      'bankAccountHolderName',
    ];

    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.ownerEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation for 10-13 digits)
    const phoneRegex = /^[0-9+\-\s()]{10,13}$/;
    if (!phoneRegex.test(body.ownerPhone)) {
      return NextResponse.json(
        { message: 'Invalid phone format' },
        { status: 400 }
      );
    }

    // Validate delivery fee if provided
    if (body.deliveryFee !== undefined) {
      const deliveryFee = parseFloat(body.deliveryFee);
      if (isNaN(deliveryFee) || deliveryFee < 0) {
        return NextResponse.json(
          { message: 'Delivery fee must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // Update vendor profile
    const updatedProfile = await prisma.vendorProfile.update({
      where: { vendorId },
      data: {
        businessName: body.businessName.trim(),
        businessType: body.businessType.trim(),
        businessRegistration: body.businessRegistration?.trim() || undefined,
        gstNumber: body.gstNumber?.trim() || undefined,
        panNumber: body.panNumber?.trim() || undefined,
        ownerName: body.ownerName.trim(),
        ownerPhone: body.ownerPhone.trim(),
        ownerEmail: body.ownerEmail.trim(),
        bankAccountNumber: body.bankAccountNumber.trim(),
        bankIfscCode: body.bankIfscCode.trim(),
        bankAccountHolderName: body.bankAccountHolderName.trim(),
        shopPhone: body.shopPhone?.trim() || undefined,
        shopEmail: body.shopEmail?.trim() || undefined,
        shopAddress: body.shopAddress?.trim() || undefined,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logo: true,
            approvalStatus: true,
          },
        },
      },
    });

    // Update vendor delivery fee if provided
    if (body.deliveryFee !== undefined) {
      const deliveryFee = parseFloat(body.deliveryFee);
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { deliveryFee },
      });
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
