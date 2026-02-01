import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Placeholder for resolving dispute
    // This would update a disputes table once it's created
    return NextResponse.json({
      message: 'Dispute resolved successfully',
      disputeId: id,
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
