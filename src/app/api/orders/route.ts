import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendVendorOrderNotification, sendCustomerOrderConfirmation } from '@/lib/email';

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
        vendor: {
          include: {
            profile: true,
          },
        },
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

    // Check if user is logged in - if so, use their email instead of delivery email
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || deliveryDetails.email;
    
    console.log('Order API - Session user:', session?.user?.email);
    console.log('Order API - Using email:', userEmail);
    console.log('Order API - Payment method:', paymentMethod);

    // Create or get user
    const tempUserId = 'guest-' + Date.now();
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        id: tempUserId,
        email: userEmail,
        name: deliveryDetails.fullName,
        phone: deliveryDetails.phone,
      },
    });

    console.log('Order API - User ID:', user.id);

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

    // Send vendor notification email
    const vendorAccount = await prisma.account.findUnique({
      where: { vendorId: cake.vendorId },
    });

    if (vendorAccount?.email && order.estimatedDelivery) {
      await sendVendorOrderNotification(
        vendorAccount.email,
        cake.vendor?.name || 'Vendor',
        order.orderNumber,
        deliveryDetails.fullName,
        deliveryDetails.email,
        deliveryDetails.phone,
        items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization || null,
        })),
        {
          fullName: deliveryDetails.fullName,
          email: deliveryDetails.email,
          phone: deliveryDetails.phone,
          address: deliveryDetails.address,
          city: deliveryDetails.city,
          landmark: deliveryDetails.landmark,
        },
        order.estimatedDelivery,
        total
      );
    }

    // Send customer confirmation email
    if (order.estimatedDelivery) {
      await sendCustomerOrderConfirmation(
        deliveryDetails.email,
        deliveryDetails.fullName,
        order.orderNumber,
        items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization || null,
        })),
        total,
        order.estimatedDelivery,
        cake.vendor?.name || 'Our Shop',
        cake.vendor?.profile?.shopPhone,
        cake.vendor?.profile?.shopEmail,
        cake.vendor?.profile?.shopAddress
      );
    }

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
