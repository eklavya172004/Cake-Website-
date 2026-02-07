import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from '@/lib/db/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { email?: string } | undefined;
    
    console.log("Profile API - Session:", sessionUser?.email);

    if (!sessionUser?.email) {
      return NextResponse.json(
        { error: "Unauthorized - no session" },
        { status: 401 }
      );
    }

    // Try to find user in database
    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    console.log("Profile API - User found:", user?.email, "Orders:", user?.orders?.length);

    // If user not in database, return session data as fallback (for demo/signup users)
    if (!user) {
      const sessionUserData = session?.user as { id?: string; name?: string; phone?: string; role?: string } | undefined;
      return NextResponse.json({
        user: {
          id: sessionUserData?.id || `temp-${Date.now()}`,
          name: sessionUserData?.name || "User",
          email: sessionUser.email,
          phone: sessionUserData?.phone || null,
          avatar: null,
          createdAt: new Date(),
          role: sessionUserData?.role || "customer"
        },
        orders: [],
        totalOrders: 0
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar: user.avatar || null,
        createdAt: user.createdAt
      },
      orders: user.orders || [],
      totalOrders: user.orders?.length || 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile";
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { email?: string; name?: string } | undefined;

    if (!sessionUser?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, phone } = await req.json();

    // Validate phone number
    if (phone && !/^[0-9]{10}$/.test(phone.replace(/[^\d]/g, ''))) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Use upsert to create user if they don't exist
    const user = await prisma.user.upsert({
      where: { email: sessionUser.email },
      update: {
        name: name || undefined,
        phone: phone || undefined,
      },
      create: {
        email: sessionUser.email,
        name: name || sessionUser.name || "User",
        phone: phone || undefined,
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
