import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "✗ Missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ Missing",
    nextAuthUrl: process.env.NEXTAUTH_URL ? "✓ Set" : "✗ Missing",
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? "✓ Set" : "✗ Missing",
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes("GOOGLE") || key.includes("NEXTAUTH"))
  });
}
