import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db/client";

export const authOptions: NextAuthOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        isSignUp: { label: "isSignUp", type: "checkbox" },
        firstName: { label: "First Name", type: "text" },
        phone: { label: "Phone", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        if (credentials.isSignUp === "true") {
          // Sign Up
          if (!credentials.firstName || !credentials.phone) {
            throw new Error("First name and phone number are required");
          }

          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: credentials.email }
            });

            if (existingUser) {
              throw new Error("User already exists");
            }

            const newUser = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.firstName,
                phone: credentials.phone
              }
            });

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name
            };
          } catch (error: any) {
            console.error("Sign up error:", error);
            throw new Error(error.message || "Failed to create user");
          }
        } else {
          // Login - just check if user exists with this email
          try {
            let user = await prisma.user.findUnique({
              where: { email: credentials.email }
            });

            // If user doesn't exist, create a guest user with that email
            if (!user) {
              user = await prisma.user.create({
                data: {
                  email: credentials.email,
                  name: "Guest User",
                  phone: ""
                }
              });
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              phone: user.phone
            };
          } catch (error: any) {
            console.error("Login error:", error);
            throw new Error("Failed to login");
          }
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Handle Google OAuth sign in
      if (account?.provider === "google" && profile) {
        // Store Google profile data in the user object
        user.id = profile.sub || user.id;
        user.email = profile.email;
        user.firstName = profile.name?.split(" ")[0] || profile.name || "";
        user.phone = "";
        user.image = profile.picture;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/",
    error: "/"
  }
};
