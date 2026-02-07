import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import crypto from "crypto";
import { sendVerificationEmail } from "./email";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "isSignUp", type: "checkbox" },
        role: { label: "Role", type: "text" },
        firstName: { label: "First Name", type: "text" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        console.log('🔍 Auth authorize called with:', {
          email: credentials?.email,
          isSignUp: credentials?.isSignUp,
          role: credentials?.role,
        });

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const role = credentials.role || "customer";

        if (credentials.isSignUp === "true") {
          // Sign Up - validate new account doesn't exist
          if (!credentials.firstName || !credentials.phone) {
            throw new Error("First name and phone are required");
          }

          // Check if email already exists in Account table
          const existingAccount = await prisma.account.findUnique({
            where: { email: credentials.email },
          });

          if (existingAccount) {
            throw new Error("Account already exists");
          }

          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newAccountId = `${role}-${Date.now()}`;
          const newVendorId = role === "vendor" ? `vendor-${Date.now()}` : undefined;

          // Create account in database immediately for customers and vendors
          const createdAccount = await prisma.account.create({
            data: {
              id: newAccountId,
              email: credentials.email,
              password: hashedPassword,
              name: credentials.firstName,
              phone: credentials.phone,
              role: role as any,
              vendorId: newVendorId,
              isVerified: false, // Account starts unverified
            },
          });

          console.log(`✅ Account created on signup: ${credentials.email}, role: ${role}, vendorId: ${newVendorId}`);

          // Generate verification token
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const tokenExpiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

          console.log('📧 About to create verification token for:', credentials.email);
          console.log('   Token model available:', prisma.emailVerificationToken !== undefined);

          try {
            const tokenRecord = await prisma.emailVerificationToken.create({
              data: {
                accountEmail: credentials.email,
                token: verificationToken,
                expiresAt: tokenExpiryTime,
              },
            });
            console.log('✅ Verification token created successfully');

            // Send verification email
            try {
              const emailResult = await sendVerificationEmail(credentials.email, verificationToken);
              console.log(`✅ Verification email sent to ${credentials.email}:`, emailResult);
            } catch (emailError) {
              console.error(`❌ Failed to send verification email to ${credentials.email}:`, emailError);
              // Still allow signup to continue, user can resend
            }
          } catch (tokenError) {
            console.error(`❌ Failed to create verification token for ${credentials.email}:`, tokenError);
            console.error('   Error details:', {
              message: tokenError instanceof Error ? tokenError.message : String(tokenError),
              stack: tokenError instanceof Error ? tokenError.stack : undefined,
            });
            // Still allow signup to succeed, user can use resend option
          }

          console.log('✅ Signup complete, returning user object');
          return {
            id: createdAccount.id,
            email: createdAccount.email,
            name: createdAccount.name,
            phone: createdAccount.phone,
            role: createdAccount.role,
            vendorId: createdAccount.vendorId || undefined,
          } as any;
        } else {
          // Login - check database for registered accounts
          const account = await prisma.account.findUnique({
            where: { email: credentials.email },
          });

          if (!account) {
            throw new Error("Account not found");
          }

          // Check if account is verified
          if (!account.isVerified) {
            throw new Error("Please verify your email before logging in. Check your inbox for a verification link.");
          }

          if (!account.password) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            account.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Update last login
          await prisma.account.update({
            where: { id: account.id },
            data: { lastLogin: new Date() },
          });

          return {
            id: account.id,
            email: account.email,
            name: account.name,
            phone: account.phone,
            role: account.role,
            vendorId: account.vendorId || undefined,
          };
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.role = user.role;
        token.vendorId = user.vendorId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.role = token.role;
        session.user.vendorId = token.vendorId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  events: {
    async signOut({ token }) {
      // Called whenever the user signs out
      console.log("User signed out:", token?.email);
    },
  },
};
