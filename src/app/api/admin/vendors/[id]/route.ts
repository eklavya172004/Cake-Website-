import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        account: {
          select: {
            email: true,
            name: true,
            phone: true,
          },
        },
        profile: true,
        cakes: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            category: true,
            isActive: true,
            createdAt: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        serviceAreas: {
          select: {
            areaName: true,
            pincode: true,
            deliveryFee: true,
          },
        },
        _count: {
          select: {
            cakes: true,
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const allOrders = await prisma.order.findMany({
      where: { vendorId },
      select: { status: true, totalAmount: true, createdAt: true },
    });

    console.log(`Vendor ${vendorId}: Found ${allOrders.length} orders`);
    console.log(`Vendor ${vendorId}: Found ${vendor._count.cakes} cakes`);

    const completedOrders = allOrders.filter((o) => o.status === 'delivered').length;
    const pendingOrders = allOrders.filter(
      (o) => ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery'].includes(o.status)
    ).length;
    const cancelledOrders = allOrders.filter((o) => o.status === 'cancelled').length;

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const thisMonthRevenue = allOrders
      .filter((o) => new Date(o.createdAt) >= thisMonthStart && o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const vendorData = {
      id: vendor.id,
      name: vendor.name,
      email: vendor.account?.email || 'N/A',
      phone: vendor.account?.phone || 'N/A',
      rating: 0,
      totalReviews: 0,
      minOrderAmount: 0,
      preparationTime: vendor.preparationTime,
      isActive: vendor.isActive,
      status: vendor.approvalStatus,
      verification: vendor.profile?.verificationStatus || 'pending',
      verifiedAt: vendor.profile?.verifiedAt?.toISOString(),
      approvedAt: vendor.profile?.approvedAt?.toISOString(),
      profile: vendor.profile
        ? {
            businessName: vendor.profile.businessName,
            businessType: vendor.profile.businessType,
            ownerName: vendor.profile.ownerName,
            ownerPhone: vendor.profile.ownerPhone,
            ownerEmail: vendor.profile.ownerEmail,
            gstNumber: vendor.profile.gstNumber,
            panNumber: vendor.profile.panNumber,
            businessProof: vendor.profile.businessProof,
            addressProof: vendor.profile.addressProof,
          }
        : null,
      serviceAreas: vendor.serviceAreas.map((area) => ({
        location: area.areaName,
        pincodes: area.pincode ? [area.pincode] : [],
        deliveryFee: area.deliveryFee,
      })),
      products: {
        total: vendor._count.cakes,
        active: vendor.cakes.filter((c) => c.isActive).length,
        inactive: vendor.cakes.filter((c) => !c.isActive).length,
      },
      orders: {
        total: vendor._count.orders,
        completed: completedOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: allOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        thisMonth: thisMonthRevenue,
      },
    };

    return NextResponse.json(vendorData);
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor details' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const body = await request.json();

    const { name, slug, description, minOrderAmount, preparationTime, isActive } = body;

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description || undefined,
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : undefined,
        preparationTime: preparationTime !== undefined ? parseInt(preparationTime) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const body = await request.json();

    const { isActive } = body;

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor status:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;

    // Delete vendor and all related data (cascading deletes)
    await prisma.vendor.delete({
      where: { id: vendorId },
    });

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
