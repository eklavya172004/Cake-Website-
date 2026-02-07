import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from '@/lib/db/client';

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No addresses found" },
        { status: 404 }
      );
    }

    const currentAddresses = (user.savedAddresses as unknown as Address[]) || [];
    const addressIndex = currentAddresses.findIndex(addr => addr.id === id);

    if (addressIndex === -1) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const updatedAddress: Address = {
      id: id,
      label,
      street,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || false
    };

    let updatedAddresses = [...currentAddresses];
    updatedAddresses[addressIndex] = updatedAddress;

    // If setting as default, remove default from others
    if (isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }));
    }

    const result = await prisma.user.update({
      where: { email: sessionUser.email },
      data: {
        savedAddresses: updatedAddresses as any
      }
    });

    return NextResponse.json({
      success: true,
      address: updatedAddress,
      addresses: (result.savedAddresses as unknown as Address[]) || []
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update address";
    console.error("Address update error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "No addresses found" },
        { status: 404 }
      );
    }

    const currentAddresses = (user.savedAddresses as unknown as Address[]) || [];
    const filteredAddresses = currentAddresses.filter(addr => addr.id !== id);

    if (filteredAddresses.length === currentAddresses.length) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // If deleted address was default and there are remaining addresses, set first as default
    const deletedWasDefault = currentAddresses.find(addr => addr.id === id)?.isDefault;
    if (deletedWasDefault && filteredAddresses.length > 0) {
      filteredAddresses[0].isDefault = true;
    }

    const result = await prisma.user.update({
      where: { email: sessionUser.email },
      data: {
        savedAddresses: filteredAddresses as any
      }
    });

    return NextResponse.json({
      success: true,
      addresses: (result.savedAddresses as unknown as Address[]) || []
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete address";
    console.error("Address delete error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
