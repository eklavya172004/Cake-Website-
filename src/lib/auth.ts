import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

          // Account will be created in the database during onboarding submission
          const newAccount = {
            id: newAccountId,
            email: credentials.email,
            password: hashedPassword,
            name: credentials.firstName,
            role: role as any,
            phone: credentials.phone,
            vendorId: newVendorId,
          };

          console.log(`✅ Vendor signup (session only): ${credentials.email}, vendorId: ${newVendorId}`);
          return newAccount as any;
        } else {
          // Login - check database for registered accounts
          const account = await prisma.account.findUnique({
            where: { email: credentials.email },
          });

          if (!account) {
            throw new Error("Account not found");
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
