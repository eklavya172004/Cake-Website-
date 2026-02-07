import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired (5 minutes)
    const now = new Date();
    if (now > verificationToken.expiresAt) {
      // Delete expired token
      await db.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update account as verified
    const account = await db.account.update({
      where: { email: verificationToken.accountEmail },
      data: {
        isVerified: true,
        verifiedAt: now,
      },
    });

    // Delete the used token
    await db.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Clear any resend attempts
    await db.resendAttempt.deleteMany({
      where: { accountEmail: account.email },
    });

    console.log(`✅ Email verified for: ${account.email}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        email: account.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
