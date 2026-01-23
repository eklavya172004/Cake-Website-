import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Demo credentials for testing (hashed passwords)
const DEMO_ACCOUNTS: Record<
  string,
  {
    id: string;
    email: string;
    password: string;
    name: string;
    role: "admin" | "vendor" | "customer";
    vendorId?: string;
    phone: string;
  }
> = {
  "admin@cakeshop.com": {
    id: "admin-1",
    email: "admin@cakeshop.com",
    password: "$2b$10$8yFpUG8UqO9DttJVp3DO7.JPRIIiP7XQRuWwCOy1GACWwinhLPpia", // admin123 hashed
    name: "Admin User",
    role: "admin",
    phone: "+91-9876543210",
  },
  "vendor@cakeshop.com": {
    id: "cmk2v0ykj00009nl0pm57q43u",
    email: "vendor@cakeshop.com",
    password: "$2b$10$9u/uQEgi2/8P8IuUo4JlXO7HGTqceJ20YFO4xnPVofIzgWt40o0z.", // vendor123 hashed
    name: "Vendor User",
    role: "vendor",
    vendorId: "cmk2v0ykj00009nl0pm57q43u",
    phone: "+91-9876543211",
  },
  "customer@cakeshop.com": {
    id: "customer-1",
    email: "customer@cakeshop.com",
    password: "$2b$10$Ox3SezpvWGdlmQ0m.OSKS.VixVcEjG9mhuyy3c5zZBr1/EG1FxF5m", // customer123 hashed
    name: "Customer User",
    role: "customer",
    phone: "+91-9876543212",
  },
};

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

        // Check if account exists in demo accounts
        const demoAccount = DEMO_ACCOUNTS[credentials.email];

        if (credentials.isSignUp === "true") {
          // Sign Up (demo mode - just validate)
          if (demoAccount) {
            throw new Error("Account already exists");
          }

          if (!credentials.firstName || !credentials.phone) {
            throw new Error("First name and phone are required");
          }

          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          const newAccount = {
            id: `${role}-${Date.now()}`,
            email: credentials.email,
            password: hashedPassword,
            name: credentials.firstName,
            role: role as any,
            phone: credentials.phone,
            vendorId: role === "vendor" ? `vendor-${Date.now()}` : undefined,
          };

          return newAccount as any;
        } else {
          // Login
          if (!demoAccount) {
            throw new Error("Account not found. Please use demo credentials.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            demoAccount.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: demoAccount.id,
            email: demoAccount.email,
            name: demoAccount.name,
            role: demoAccount.role,
            vendorId: demoAccount.vendorId,
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
    error: "/auth/login",
  },
};
