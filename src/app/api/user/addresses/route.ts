import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Address {
  id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { email?: string } | undefined;

    if (!sessionUser?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const addresses = (user.savedAddresses as unknown as Address[]) || [];

    return NextResponse.json({
      success: true,
      addresses: addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch addresses";
    console.error("Addresses fetch error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { email?: string } | undefined;

    if (!sessionUser?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { label, street, city, state, pincode, phone, isDefault } = await req.json();

    // Validate required fields
    if (!label || !street || !city || !state || !pincode || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone.replace(/[^\d]/g, ''))) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Validate pincode
    if (!/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Invalid pincode" },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
    });

    if (!user) {
      // Create user if they don't exist
      const sessionUserData = session?.user as { name?: string } | undefined;
      user = await prisma.user.create({
        data: {
          email: sessionUser.email,
          name: sessionUserData?.name || "User",
        }
      });
    }

    const currentAddresses = (user.savedAddresses as unknown as Address[]) || [];
    
    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      label,
      street,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || currentAddresses.length === 0
    };

    // If setting as default, remove default from others
    let updatedAddresses = currentAddresses;
    if (isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    }

    updatedAddresses.push(newAddress);

    const updatedUser = await prisma.user.update({
      where: { email: sessionUser.email },
      data: {
        savedAddresses: updatedAddresses as unknown as any
      }
    });

    return NextResponse.json({
      success: true,
      address: newAddress,
      addresses: (updatedUser.savedAddresses as unknown as Address[]) || []
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create address";
    console.error("Address creation error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
