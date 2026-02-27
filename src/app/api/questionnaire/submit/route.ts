import { NextRequest, NextResponse } from "next/server";
import { upsertScores, type Source } from "@/lib/db";
import { calculateScores, HEXACO_60_ITEMS } from "@/lib/hexaco-questions";

const VALID_SOURCES: Source[] = ["self", "other"];

/**
 * POST /api/questionnaire/submit
 *
 * Receives raw questionnaire answers, calculates dimension scores server-side,
 * and stores them. No API key needed — the participant token acts as auth.
 *
 * Body:
 * {
 *   "token": "participant-token",
 *   "source": "self" | "other",
 *   "answers": { "1": 3, "2": 5, ... }   // item number → response (1-5)
 * }
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { token, source, answers } = body;

  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid 'token'" },
      { status: 400 }
    );
  }

  if (!VALID_SOURCES.includes(source as Source)) {
    return NextResponse.json(
      { error: `Invalid 'source'. Must be one of: ${VALID_SOURCES.join(", ")}` },
      { status: 400 }
    );
  }

  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return NextResponse.json(
      { error: "Missing or invalid 'answers' object" },
      { status: 400 }
    );
  }

  // Validate all 60 answers are present and in range
  const parsed: Record<number, number> = {};
  for (const item of HEXACO_60_ITEMS) {
    const raw = (answers as Record<string, unknown>)[String(item.number)];
    const val = Number(raw);
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      return NextResponse.json(
        { error: `Invalid or missing answer for item ${item.number}. Must be 1-5.` },
        { status: 400 }
      );
    }
    parsed[item.number] = val;
  }

  const scores = calculateScores(parsed);
  if (!scores) {
    return NextResponse.json(
      { error: "Failed to calculate scores" },
      { status: 500 }
    );
  }

  const success = await upsertScores(token.trim(), source as Source, scores);

  if (!success) {
    return NextResponse.json(
      { error: "Participant not found for the given token" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, scores });
}
