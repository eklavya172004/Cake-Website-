import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

const RESEND_COOLDOWN_SECONDS = 10;
const MAX_RESEND_ATTEMPTS = 4;
const LOCKOUT_MINUTES = 15;
const TOKEN_EXPIRY_MINUTES = 5;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify account exists
    const account = await db.account.findUnique({
      where: { email },
    });

    if (!account) {
      // Don't reveal if account doesn't exist
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, you will receive a verification link.',
        },
        { status: 200 }
      );
    }

    // If already verified, return success
    if (account.isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Account is already verified. You can now login.',
        },
        { status: 200 }
      );
    }

    const now = new Date();

    // Check resend attempts
    let resendAttempt = await db.resendAttempt.findUnique({
      where: { accountEmail: email },
    });

    // Check if account is locked
    if (resendAttempt?.lockedUntil && now < resendAttempt.lockedUntil) {
      const minutesRemaining = Math.ceil(
        (resendAttempt.lockedUntil.getTime() - now.getTime()) / 1000 / 60
      );

      return NextResponse.json(
        {
          error: 'Too many verification attempts. Please try again later.',
          lockedUntil: resendAttempt.lockedUntil,
          minutesRemaining,
        },
        { status: 429 }
      );
    }

    // Reset if lockout has expired
    if (resendAttempt?.lockedUntil && now >= resendAttempt.lockedUntil) {
      resendAttempt = null;
    }

    // Check attempt count and cooldown
    if (resendAttempt) {
      const timeSinceLastAttempt = Math.floor(
        (now.getTime() - resendAttempt.lastAttemptAt.getTime()) / 1000
      );

      // If more than 4 attempts in the cooldown window
      if (
        resendAttempt.attemptCount >= MAX_RESEND_ATTEMPTS &&
        timeSinceLastAttempt < RESEND_COOLDOWN_SECONDS
      ) {
        // Lock the account
        const lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
        await db.resendAttempt.update({
          where: { accountEmail: email },
          data: { lockedUntil },
        });

        return NextResponse.json(
          {
            error: 'Too many verification attempts. Please try again in 15 minutes.',
            lockedUntil,
            minutesRemaining: LOCKOUT_MINUTES,
          },
          { status: 429 }
        );
      }

      // Increment attempt count
      resendAttempt = await db.resendAttempt.update({
        where: { accountEmail: email },
        data: {
          attemptCount: resendAttempt.attemptCount + 1,
          lastAttemptAt: now,
        },
      });
    } else {
      // Create new resend attempt record
      resendAttempt = await db.resendAttempt.create({
        data: {
          accountEmail: email,
          attemptCount: 1,
          lastAttemptAt: now,
        },
      });
    }

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Delete any existing tokens for this email
    await db.emailVerificationToken.deleteMany({
      where: { accountEmail: email },
    });

    // Create new token
    await db.emailVerificationToken.create({
      data: {
        accountEmail: email,
        token,
        expiresAt,
      },
    });

    console.log(`📧 Resending verification email to: ${email}`);
    console.log(`   Attempt: ${resendAttempt.attemptCount}/${MAX_RESEND_ATTEMPTS}`);

    // Send verification email
    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    const attemptsRemaining = MAX_RESEND_ATTEMPTS - resendAttempt.attemptCount;

    console.log(`✅ Verification email sent. Attempts remaining: ${attemptsRemaining}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Verification email sent. Check your inbox.',
        attemptsRemaining: Math.max(0, attemptsRemaining),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
