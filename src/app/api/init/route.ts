import { NextResponse } from "next/server";
import { migrate } from "@/lib/db";

/**
 * GET /api/init
 *
 * Creates database tables if they don't exist.
 * Safe to call multiple times (uses IF NOT EXISTS).
 */
export async function GET() {
  try {
    await migrate();
    return NextResponse.json({ success: true, message: "Tables created" });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
