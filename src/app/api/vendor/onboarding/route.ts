import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    let vendorId = formData.get('vendorId') as string;
    const sessionVendorId = formData.get('sessionVendorId') as string;
    const accountEmail = formData.get('accountEmail') as string;
    const accountPassword = formData.get('accountPassword') as string;
    const dataString = formData.get('data') as string;

    const data = JSON.parse(dataString);

    // Use sessionVendorId if available (already set in Account), otherwise use vendorId or generate new one
    if (sessionVendorId) {
      vendorId = sessionVendorId;
      console.log('Using sessionVendorId:', vendorId);
    } else if (!vendorId) {
      vendorId = `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated new vendorId:', vendorId);
    }

    // Ensure vendor exists in the database
    const vendorExists = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendorExists) {
      // Create vendor record if it doesn't exist
      // Generate slug from business name with uniqueness check
      let baseSlug = data.businessName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Check if slug already exists and make it unique
      while (await prisma.vendor.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
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
        shopPhone: data.shopPhone,
        shopEmail: data.shopEmail,
        shopAddress: data.shopAddress,
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
        shopPhone: data.shopPhone,
        shopEmail: data.shopEmail,
        shopAddress: data.shopAddress,
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
    // Use accountEmail (login email) instead of ownerEmail to ensure correct account is updated
    // Use upsert to create the Account if it doesn't exist
    if (accountEmail) {
      try {
        // Hash password if provided
        let hashedPassword: string | undefined;
        if (accountPassword) {
          hashedPassword = await bcrypt.hash(accountPassword, 10);
        }

        const updatedAccount = await prisma.account.upsert({
          where: { email: accountEmail },
          update: {
            vendorId: vendorId,
            ...(hashedPassword && { password: hashedPassword }),
          },
          create: {
            email: accountEmail,
            password: hashedPassword || null,
            name: data.ownerName || 'Vendor User',
            phone: data.ownerPhone,
            role: 'vendor',
            vendorId: vendorId,
            isActive: true,
            isVerified: true,
          },
        });
        console.log(`✅ Account linked/created for email ${accountEmail} with vendorId: ${vendorId}`, updatedAccount);
      } catch (accountError) {
        console.error(`❌ Error updating Account for ${accountEmail}:`, accountError);
        // Don't fail the whole request if account update fails
        console.log('Continuing despite account error...');
      }
    }

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
