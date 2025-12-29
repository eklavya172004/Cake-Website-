import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
            rating: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        deliveryPartner: {
          select: {
            id: true,
            name: true,
            phone: true,
            currentLat: true,
            currentLng: true,
            lastLocationUpdate: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify the order belongs to the authenticated user
    if (order.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
