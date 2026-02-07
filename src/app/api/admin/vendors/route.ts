import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

export async function GET() {
  try {
    console.log('=== ADMIN VENDORS API CALLED ===');
    const vendors = await prisma.vendor.findMany({
      include: {
        profile: true,
        serviceAreas: true,
        account: {
          select: {
            email: true,
            name: true,
            phone: true,
          },
        },
        _count: { select: { cakes: true, orders: true } },
      },
    });

    const vendorData = vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      owner: vendor.account?.name || vendor.name,
      email: vendor.account?.email || 'N/A',
      phone: vendor.account?.phone || 'N/A',
      orders: vendor._count.orders,
      products: vendor._count.cakes,
      rating: vendor.rating || 0,
      revenue: 0,
      status: vendor.approvalStatus,
      verification: vendor.profile?.verificationStatus || 'pending',
      profile: vendor.profile ? {
        businessName: vendor.profile.businessName,
        businessType: vendor.profile.businessType,
        businessRegistration: vendor.profile.businessRegistration,
        ownerName: vendor.profile.ownerName,
        ownerPhone: vendor.profile.ownerPhone,
        businessProof: vendor.profile.businessProof,
        addressProof: vendor.profile.addressProof,
      } : null,
      serviceAreas: vendor.serviceAreas.map((area) => ({
        location: area.areaName,
        pincodes: [area.pincode],
      })),
    }));

    return NextResponse.json(vendorData);
  } catch (error) {
    console.error('Vendors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
