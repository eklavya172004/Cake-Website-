import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, vendor: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formattedOrders = orders.map((order) => ({
      id: order.orderNumber,
      customerName: order.user?.name || 'Unknown',
      vendorName: order.vendor?.name || 'Unknown',
      amount: order.finalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString(),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
