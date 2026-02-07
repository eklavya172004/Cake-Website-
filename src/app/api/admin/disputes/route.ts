import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

interface Dispute {
  id: string;
  vendorName: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'open' | 'resolved' | 'escalated';
  date: string;
}

export async function GET() {
  try {
    // For now, we'll return empty disputes since there's no disputes table
    // In a real implementation, you would fetch from a disputes table
    const disputes: Dispute[] = [
      // Placeholder for disputes
      // This would be replaced with actual DB queries once disputes table is added
    ];

    return NextResponse.json(disputes);
  } catch (error) {
    console.error('Disputes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
