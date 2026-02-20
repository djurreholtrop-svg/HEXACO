import { NextRequest, NextResponse } from "next/server";
import { upsertScores, type Source, type HexacoScores } from "@/lib/db";

const VALID_SOURCES: Source[] = ["self", "ai", "other"];

const DIMENSION_KEYS: (keyof HexacoScores)[] = [
  "honesty_humility",
  "emotionality",
  "extraversion",
  "agreeableness",
  "conscientiousness",
  "openness",
];

function validateScore(value: unknown): number | null {
  const n = Number(value);
  if (isNaN(n) || n < 1 || n > 5) return null;
  return Math.round(n * 100) / 100;
}

/**
 * POST /api/scores
 *
 * Receives HEXACO-60 dimension scores from Qualtrics.
 *
 * Headers:
 *   X-API-Key: <API_SECRET_KEY>
 *
 * Body (JSON):
 * {
 *   "token": "participant-token",
 *   "source": "self" | "ai" | "other",
 *   "honesty_humility": 3.5,
 *   "emotionality": 2.8,
 *   "extraversion": 4.1,
 *   "agreeableness": 3.2,
 *   "conscientiousness": 4.0,
 *   "openness": 3.7
 * }
 *
 * All dimension scores should be between 1.0 and 5.0.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.API_SECRET_KEY;
  if (apiKey) {
    const provided = request.headers.get("x-api-key");
    if (provided !== apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { token, source } = body;

  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid 'token'" },
      { status: 400 }
    );
  }

  if (!VALID_SOURCES.includes(source as Source)) {
    return NextResponse.json(
      {
        error: `Invalid 'source'. Must be one of: ${VALID_SOURCES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const scores: Partial<HexacoScores> = {};
  for (const key of DIMENSION_KEYS) {
    const val = validateScore(body[key]);
    if (val === null) {
      return NextResponse.json(
        {
          error: `Invalid or missing '${key}'. Must be a number between 1 and 5.`,
        },
        { status: 400 }
      );
    }
    scores[key] = val;
  }

  const success = upsertScores(
    token.trim(),
    source as Source,
    scores as HexacoScores
  );

  if (!success) {
    return NextResponse.json(
      { error: "Participant not found for the given token" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
