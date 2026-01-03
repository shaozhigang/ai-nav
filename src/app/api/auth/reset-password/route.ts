import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verification, account } from "@/lib/db/schema";
import { eq, and, gt, like } from "drizzle-orm";
import crypto from "crypto";
import { hashPassword } from "@/lib/auth";

const VERIFICATION_TYPE = "password_reset";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash the token to match what's in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid token in verification table
    const resetToken = await db
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

    if (!resetToken || resetToken.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const tokenData = resetToken[0];
    // Extract userId from identifier (format: "password_reset:userId")
    const userId = tokenData.identifier.replace(`${VERIFICATION_TYPE}:`, "");

    // Ensure user has a credential account
    const credentialAccount = await db
      .select({ id: account.id })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, "credential")
        )
      )
      .limit(1);

    if (credentialAccount.length === 0) {
      return NextResponse.json(
        { message: "Password reset is not available for this account" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user's password in the account table and ensure the update succeeds
    const updatedAccounts = await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, "credential")
        )
      )
      .returning({ id: account.id });

    if (updatedAccounts.length === 0) {
      return NextResponse.json(
        { message: "Failed to update password" },
        { status: 500 }
      );
    }

    // Delete the used token
    await db
      .delete(verification)
      .where(eq(verification.identifier, tokenData.identifier));

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
