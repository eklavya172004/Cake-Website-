import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendorId = id;

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        approvalStatus: 'rejected',
      },
    });

    return NextResponse.json({
      message: 'Vendor rejected',
      vendor,
    });
  } catch (error) {
    console.error('Rejection error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
