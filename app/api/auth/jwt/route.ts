// app/api/auth/jwt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

// IMPORTANT: Move this secret to a secure environment variable (e.g., in .env.local)
// For example: JWT_SECRET=your-super-secret-and-long-random-string
const JWT_SECRET = process.env.JWT_SECRET || "this-is-a-temporary-and-insecure-secret";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify the better-auth session
    const session = await auth.api.getSession({
      headers:await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Create the JWT payload
    const payload = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      // Add any other user data you want in the token
    };

    // 3. Sign the JWT
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h", // Token expiration time (e.g., 1 hour)
    });

    // 4. Return the token
    return NextResponse.json({ token });

  } catch (error) {
    console.error("JWT Issuance Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
