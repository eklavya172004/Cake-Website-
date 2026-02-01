import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const vendorId = formData.get('vendorId') as string;
    const dataString = formData.get('data') as string;

    if (!vendorId) {
      return NextResponse.json(
        { message: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const data = JSON.parse(dataString);

    // Ensure vendor exists in the database
    const vendorExists = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendorExists) {
      // Create vendor record if it doesn't exist
      // Generate slug from business name
      const slug = data.businessName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      
      await prisma.vendor.create({
        data: {
          id: vendorId,
          name: data.businessName,
          slug: slug,
          preparationTime: 30, // Default 30 minutes
          approvalStatus: 'pending',
        },
      });
    }

    // Update vendor profile with onboarding data
    // First check if this GST number is already used by another vendor
    if (data.gstNumber) {
      const existingProfile = await prisma.vendorProfile.findFirst({
        where: {
          gstNumber: data.gstNumber,
          vendorId: { not: vendorId } // Exclude current vendor
        }
      });

      if (existingProfile) {
        return NextResponse.json(
          { message: 'GST number already registered with another vendor' },
          { status: 409 }
        );
      }
    }

    // Same check for PAN number
    if (data.panNumber) {
      const existingProfile = await prisma.vendorProfile.findFirst({
        where: {
          panNumber: data.panNumber,
          vendorId: { not: vendorId } // Exclude current vendor
        }
      });

      if (existingProfile) {
        return NextResponse.json(
          { message: 'PAN number already registered with another vendor' },
          { status: 409 }
        );
      }
    }

    await prisma.vendorProfile.upsert({
      where: { vendorId },
      update: {
        businessName: data.businessName,
        businessType: data.businessType,
        businessRegistration: data.businessRegistration,
        gstNumber: data.gstNumber || null,
        panNumber: data.panNumber || null,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail,
        bankAccountNumber: data.bankAccountNumber,
        bankIfscCode: data.bankIfscCode,
        bankAccountHolderName: data.bankAccountHolderName,
      },
      create: {
        vendorId,
        businessName: data.businessName,
        businessType: data.businessType,
        businessRegistration: data.businessRegistration,
        gstNumber: data.gstNumber || null,
        panNumber: data.panNumber || null,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail,
        bankAccountNumber: data.bankAccountNumber,
        bankIfscCode: data.bankIfscCode,
        bankAccountHolderName: data.bankAccountHolderName,
      },
    });

    // Add service areas using the actual schema fields
    // First delete existing service areas
    await prisma.vendorServiceArea.deleteMany({
      where: { vendorId },
    });

    // Add new service areas
    for (const area of data.serviceAreas) {
      await prisma.vendorServiceArea.create({
        data: {
          vendorId,
          areaName: area.location,
          pincode: area.pincodes.split(',')[0]?.trim() || '000000',
          city: 'City',
          state: 'State',
          centerLatitude: 28.7041,
          centerLongitude: 77.1025,
          deliveryRadius: 5,
          deliveryFee: area.deliveryFee,
          minDeliveryTime: 30,
          maxDeliveryTime: 60,
        },
      });
    }

    // Update vendor status to pending approval
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        approvalStatus: 'pending',
      },
    });

    // Link the Account record to the Vendor by updating vendorId
    await prisma.account.updateMany({
      where: { email: data.ownerEmail },
      data: { vendorId: vendorId },
    });

    return NextResponse.json(
      { message: 'Onboarding submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
