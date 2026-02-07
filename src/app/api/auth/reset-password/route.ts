import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import bcrypt from 'bcryptjs';

// Helper function to wait for database connection
async function waitForDb(maxAttempts = 5, delayMs = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await db.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();

    // Validate inputs
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, password, and confirmation are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Wait for database to be ready
    const dbReady = await waitForDb();
    if (!dbReady) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find and verify token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (new Date() > resetToken.expiresAt) {
      // Delete expired token
      await db.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: 'Reset link has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update account password
    await db.account.update({
      where: { email: resetToken.accountEmail },
      data: { password: hashedPassword },
    });

    // Delete used token
    await db.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
