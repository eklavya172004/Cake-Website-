import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      deliveryDetails,
      deliveryType,
      paymentMethod,
      subtotal,
      deliveryFee,
      discount,
      total,
      notes,
      paymentStatus,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!deliveryDetails || !deliveryDetails.pincode) {
      return NextResponse.json(
        { error: 'Delivery details are required' },
        { status: 400 }
      );
    }

    // Get the vendor from the first item (assuming all items are from the same vendor)
    const firstItem = items[0];
    const cake = await prisma.cake.findFirst({
      where: {
        id: firstItem.cakeId,
      },
      include: {
        vendor: true,
      },
    });

    if (!cake) {
      return NextResponse.json(
        { error: 'Cake not found' },
        { status: 404 }
      );
    }

    // Generate order number
    const timestamp = new Date();
    const orderNumber = `ORD-${timestamp.getFullYear()}-${String(timestamp.getTime()).slice(-6)}`;

    // Create or get temporary user
    const tempUserId = 'guest-' + Date.now();
    const user = await prisma.user.upsert({
      where: { email: deliveryDetails.email },
      update: {},
      create: {
        id: tempUserId,
        email: deliveryDetails.email,
        name: deliveryDetails.fullName,
        phone: deliveryDetails.phone,
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        vendorId: cake.vendorId,
        userId: user.id,
        items: items.map((item: any) => ({
          cakeId: item.cakeId,
          name: item.name,
          quantity: item.quantity,
          customization: item.customization || null,
          price: item.price,
        })),
        deliveryAddress: {
          fullName: deliveryDetails.fullName,
          email: deliveryDetails.email,
          phone: deliveryDetails.phone,
          address: deliveryDetails.address,
          city: deliveryDetails.city,
          landmark: deliveryDetails.landmark,
        },
        deliveryPincode: deliveryDetails.pincode,
        status: 'pending',
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'processing'),
        totalAmount: subtotal,
        deliveryFee,
        discount,
        finalAmount: total,
        estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        notes: notes || null,
      },
      include: {
        vendor: true,
      },
    });

    // Create initial status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        message: 'Order placed successfully. Waiting for vendor confirmation.',
        createdBy: 'system',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        vendor: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
