import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

/**
 * DEVELOPMENT ONLY - Creates a test order for the specified user
 * Do NOT use in production!
 */
export async function POST(request: NextRequest) {
  // Security check - only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userEmail, vendorId } = body;

    if (!userEmail || !vendorId) {
      return NextResponse.json(
        { error: "userEmail and vendorId are required" },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userEmail.split('@')[0],
          phone: '+91-9999999999'
        }
      });
    }

    // Get vendor and a cake
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        cakes: {
          take: 1
        }
      }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    if (vendor.cakes.length === 0) {
      return NextResponse.json(
        { error: "No cakes available for this vendor" },
        { status: 400 }
      );
    }

    const cake = vendor.cakes[0];
    const basePrice = cake.basePrice || 500;
    const deliveryFee = 50;
    const totalAmount = basePrice + deliveryFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        userId: user.id,
        vendorId: vendor.id,
        items: [
          {
            cakeId: cake.id,
            name: cake.name,
            quantity: 1,
            price: basePrice,
            customization: {}
          }
        ],
        deliveryAddress: {
          street: "123 Test Street",
          area: "Test Area",
          city: "New Delhi",
          landmark: "Test Landmark"
        },
        deliveryPincode: "110001",
        status: "confirmed",
        totalAmount,
        deliveryFee,
        finalAmount: totalAmount,
        paymentMethod: "online",
        paymentStatus: "completed",
        vendorAcceptedAt: new Date(),
        preparationStartedAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            email: true,
            address: true,
            logo: true,
            rating: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    });

    // Create initial status history entry
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "confirmed",
        message: "Order confirmed by vendor",
        createdBy: "system"
      }
    });

    return NextResponse.json({
      success: true,
      order,
      message: `Test order created successfully for ${userEmail}`
    });
  } catch (error: any) {
    console.error("Error creating test order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test order" },
      { status: 500 }
    );
  }
}
