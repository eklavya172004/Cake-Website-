import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const { email, isSignUp, firstName, phone } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (isSignUp) {
      // Sign Up
      if (!firstName || !phone) {
        return NextResponse.json(
          { error: "First name and phone number are required" },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          email,
          name: firstName,
          phone
        }
      });

      return NextResponse.json({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone
      });
    } else {
      // Login - check if user exists, if not create a guest account
      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: "Guest User",
            phone: ""
          }
        });
      }

      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      });
    }
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
