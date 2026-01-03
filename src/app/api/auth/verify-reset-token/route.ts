import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema";
import { eq, and, gt, like } from "drizzle-orm";
import crypto from "crypto";

const VERIFICATION_TYPE = "password_reset";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // Hash the token to match what's in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid token in verification table
    const validToken = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.value, hashedToken),
          like(verification.identifier, `${VERIFICATION_TYPE}:%`),
          gt(verification.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!validToken || validToken.length === 0) {
      return NextResponse.json(
        { valid: false, message: "Invalid or expired token" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { valid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { valid: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}