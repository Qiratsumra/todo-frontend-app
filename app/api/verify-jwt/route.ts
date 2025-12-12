import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "No token provided" },
                { status: 401 }
            );
        }
        
        const token = authHeader.split(" ")[1];
        
        // Verify JWT
        const JWKS = createRemoteJWKSet(
            new URL(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/jwks`)
        );
        
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: process.env.NEXT_PUBLIC_APP_URL,
            audience: process.env.NEXT_PUBLIC_APP_URL,
        });
        
        return NextResponse.json({
            message: "Token is valid!",
            user: payload
        });
        
    } catch (error) {
        console.error("JWT verification failed:", error);
        return NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 401 }
        );
    }
}