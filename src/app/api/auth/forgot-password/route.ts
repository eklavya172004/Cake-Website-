import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { email } = await request.json();

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Wait for database to be ready
    const dbReady = await waitForDb();
    if (!dbReady) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Check if account exists
    const account = await db.account.findUnique({
      where: { email },
    });

    if (!account) {
      // Don't reveal if email exists for security reasons
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create password reset token
    await db.passwordResetToken.create({
      data: {
        accountEmail: email,
        token,
        expiresAt,
      },
    });

    // Build reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password/${token}`;

    // Send email via Resend
    try {
      const emailResponse = await resend.emails.send({
        from: 'noreply@purblepalace.in',
        to: email,
        subject: 'Reset Your Password - PurblePalace',
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to right, #ec4899, #a855f7); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
              .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .button { display: inline-block; background: linear-gradient(to right, #ec4899, #a855f7); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎂 PurblePalace</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" class="button">Reset Password</a>
                </p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 PurblePalace. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      });

      console.log('Email sent successfully:', emailResponse);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Still return success response for security, but log the error
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
