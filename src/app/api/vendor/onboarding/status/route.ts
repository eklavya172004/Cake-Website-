import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the account to find vendor ID
    const account = await prisma.account.findFirst({
      where: { email: session.user.email },
    });

    if (!account || !account.vendorId) {
      return NextResponse.json(
        { message: 'No onboarding data found' },
        { status: 404 }
      );
    }

    // Get vendor profile and service areas
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { vendorId: account.vendorId },
    });

    if (!vendorProfile) {
      return NextResponse.json(
        { message: 'No onboarding data found' },
        { status: 404 }
      );
    }

    const serviceAreas = await prisma.vendorServiceArea.findMany({
      where: { vendorId: account.vendorId },
    });

    // Get vendor status
    const vendor = await prisma.vendor.findUnique({
      where: { id: account.vendorId },
      select: { approvalStatus: true, createdAt: true },
    });

    // Format service areas to match frontend expectations
    const formattedServiceAreas = serviceAreas.map((area) => ({
      location: area.areaName,
      pincodes: area.pincode, // You might need to adjust this if you store multiple pincodes differently
      deliveryFee: area.deliveryFee,
      operatingHours: {
        start: '08:00', // Default, you might want to store this in the database
        end: '22:00',
      },
    }));

    return NextResponse.json({
      status: vendor?.approvalStatus || 'pending',
      submittedAt: vendor?.createdAt || new Date(),
      businessName: vendorProfile.businessName,
      businessType: vendorProfile.businessType,
      businessRegistration: vendorProfile.businessRegistration,
      gstNumber: vendorProfile.gstNumber,
      panNumber: vendorProfile.panNumber,
      ownerName: vendorProfile.ownerName,
      ownerPhone: vendorProfile.ownerPhone,
      ownerEmail: vendorProfile.ownerEmail,
      bankAccountNumber: vendorProfile.bankAccountNumber,
      bankIfscCode: vendorProfile.bankIfscCode,
      bankAccountHolderName: vendorProfile.bankAccountHolderName,
      serviceAreas: formattedServiceAreas,
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
