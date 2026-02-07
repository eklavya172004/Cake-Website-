import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('Reset: No valid session');
      return NextResponse.json({ 
        message: 'No active session. Please logout and login again.',
        redirectToLogin: true
      }, { status: 401 });
    }

    const email = session.user.email;
    console.log(`🔄 Reset endpoint called for: ${email}`);
    
    // Get the account
    let account = await prisma.account.findUnique({
      where: { email },
    });

    if (!account) {
      console.log(`Account not found for ${email}, but will try to delete vendor anyway`);
      // Account doesn't exist, but we can still try to delete the vendor if we have vendorId from session
      const sessionVendorId = (session.user as any).vendorId;
      if (sessionVendorId) {
        try {
          await prisma.vendor.delete({
            where: { id: sessionVendorId },
          }).catch(() => {});
        } catch (e) {
          console.log('Could not delete vendor:', e);
        }
      }
      return NextResponse.json({
        message: 'Account was already deleted. Please logout and login again.',
        redirectToLogin: true
      }, { status: 200 });
    }

    console.log(`🔄 Resetting vendor for ${email}, vendorId: ${account.vendorId}`);

    // Delete vendor if it exists (this will cascade delete related records)
    if (account.vendorId) {
      try {
        await prisma.vendor.delete({
          where: { id: account.vendorId },
        });
        console.log(`✅ Deleted vendor: ${account.vendorId}`);
      } catch (deleteError) {
        console.log(`⚠️ Could not delete vendor ${account.vendorId}:`, deleteError);
        // Continue anyway
      }
    }

    // Reset the account - clear vendorId
    const updatedAccount = await prisma.account.update({
      where: { email },
      data: { vendorId: null },
    });

    console.log(`✅ Reset account for ${email}, vendorId cleared`);

    return NextResponse.json({
      message: 'Vendor reset successfully. Please logout and login again.',
      email,
      vendorIdCleared: true,
      redirectToLogin: true
    }, { status: 200 });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to reset vendor',
        message: 'An error occurred during reset. Please try logging out manually and logging back in.'
      },
      { status: 500 }
    );
  }
}
