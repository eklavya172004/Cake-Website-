import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

/**
 * DEVELOPMENT ONLY - Creates a test order for the currently logged-in user
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
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          phone: '+91-9999999999'
        }
      });
    }

    // Get first available vendor with cakes
    const vendor = await prisma.vendor.findFirst({
      where: { isActive: true },
      include: {
        cakes: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "No active vendors available" },
        { status: 404 }
      );
    }

    if (vendor.cakes.length === 0) {
      return NextResponse.json(
        { error: "No cakes available for any vendor" },
        { status: 400 }
      );
    }

    const cake = vendor.cakes[0];
    const basePrice = parseFloat(cake.basePrice.toString()) || 500;
    const deliveryFee = parseFloat(vendor.deliveryFee.toString()) || 50;
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
            customization: "No special customization"
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
      message: `Test order created successfully for ${session.user.email}. You can now view it in your profile.`
    });
  } catch (error: any) {
    console.error("Error creating test order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test order" },
      { status: 500 }
    );
  }
}

/**
 * GET - List available vendors (for reference)
 */
export async function GET(request: NextRequest) {
  // Security check - only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        rating: true
      },
      take: 10
    });

    return NextResponse.json({
      vendors,
      message: `Found ${vendors.length} active vendors. Use vendor ID to create test order.`
    });
  } catch (error: any) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
