import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            totalAmount: true,
            deliveryFee: true,
            discount: true,
            finalAmount: true,
            notes: true,
            items: true,
            deliveryAddress: true,
            estimatedDelivery: true,
            createdAt: true,
            updatedAt: true,
            vendor: {
              select: {
                name: true,
                slug: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        notifications: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log('Profile API - User orders:', user.orders.map(o => ({
      id: o.id,
      paymentMethod: o.paymentMethod,
      notes: o.notes ? (o.notes.length > 100 ? o.notes.substring(0, 100) + '...' : o.notes) : 'null'
    })));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      orders: user.orders,
      totalOrders: user.orders.length,
      recentNotifications: user.notifications
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
