import { NextRequest, NextResponse } from "next/server";
import {
  upsertAgreement,
  getAgreementByToken,
  listAgreementResponses,
} from "@/lib/db";

/**
 * POST /api/agreement
 *
 * Save a participant's Likert-scale agreement ratings for the AI agent scores.
 *
 * Body (JSON):
 * {
 *   "token": "participant-token",
 *   "q1": 5, "q2": 2, "q3": 3, "q4": 1
 * }
 *
 * Each q value must be an integer between 1 and 7.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const token =
    typeof body.token === "string" ? body.token.trim() : null;
  if (!token) {
    return NextResponse.json(
      { error: "Missing 'token'" },
      { status: 400 }
    );
  }

  const questions = ["q1", "q2", "q3", "q4"] as const;
  const values: number[] = [];

  for (const key of questions) {
    const n = Number(body[key]);
    if (!Number.isInteger(n) || n < 1 || n > 7) {
      return NextResponse.json(
        { error: `Invalid '${key}'. Must be an integer between 1 and 7.` },
        { status: 400 }
      );
    }
    values.push(n);
  }

  const success = await upsertAgreement(
    token,
    values[0],
    values[1],
    values[2],
    values[3]
  );

  if (!success) {
    return NextResponse.json(
      { error: "Participant not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

/**
 * GET /api/agreement
 *
 * Retrieve agreement responses.
 *
 * ?token=xxx  → returns a single participant's responses (public)
 * No token    → returns all responses (requires X-API-Key header)
 * ?format=csv → returns CSV instead of JSON (requires X-API-Key)
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  // Single participant lookup (public, token-authenticated)
  if (token) {
    const response = await getAgreementByToken(token.trim());
    if (!response) {
      return NextResponse.json({ submitted: false });
    }
    return NextResponse.json({ submitted: true, ...response });
  }

  // List all — requires API key
  const apiKey = process.env.API_SECRET_KEY;
  if (apiKey) {
    const provided = request.headers.get("x-api-key");
    if (provided !== apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const rows = await listAgreementResponses();

  const format = request.nextUrl.searchParams.get("format");
  if (format === "csv") {
    const header = "token,label,q1,q2,q3,q4,created_at";
    const csvRows = rows.map(
      (r) =>
        `${r.token},"${(r.label ?? "").replace(/"/g, '""')}",${r.q1},${r.q2},${r.q3},${r.q4},${r.created_at}`
    );
    const csv = [header, ...csvRows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=agreement_responses.csv",
      },
    });
  }

  return NextResponse.json(rows);
}
