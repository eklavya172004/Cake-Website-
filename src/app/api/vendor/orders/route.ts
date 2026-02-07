import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor' || !account.vendorId) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { vendorId: account.vendorId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || 'Unknown',
      email: order.user?.email,
      totalAmount: order.finalAmount,
      deliveryFee: order.deliveryFee,
      status: order.status,
      itemsCount: Array.isArray(order.items) ? order.items.length : 0,
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            cakeName: item.name,
            quantity: item.quantity,
            price: item.price,
            customization: item.customization,
          }))
        : [],
      deliveryAddress: order.deliveryAddress,
      deliveryDate: order.estimatedDelivery,
      createdAt: order.createdAt,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Vendor orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
