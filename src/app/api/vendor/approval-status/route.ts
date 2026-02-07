import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, checkDatabaseConnection } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.warn('Database connection not ready, returning pending status');
      return NextResponse.json(
        { status: 'pending' },
        { status: 200 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { status: 'pending' },
        { status: 200 }
      );
    }

    // Get account from database to get the correct vendorId
    const account = await db.account.findUnique({
      where: { email: session.user.email },
      select: { vendorId: true },
    });

    if (!account?.vendorId) {
      return NextResponse.json(
        { status: 'pending' },
        { status: 200 }
      );
    }

    // Get vendor approval status using account's vendorId
    const vendor = await db.vendor.findUnique({
      where: { id: account.vendorId },
      select: { 
        approvalStatus: true,
      },
    });

    const approvalStatus = vendor?.approvalStatus || 'pending';
    console.log('✅ Approval Status API - Vendor:', { vendorId: account.vendorId, approvalStatus, vendorExists: !!vendor });

    return NextResponse.json({
      status: approvalStatus,
    });
  } catch (error) {
    console.error('Error getting approval status:', error);
    return NextResponse.json(
      { status: 'pending' },
      { status: 200 }
    );
  }
}
