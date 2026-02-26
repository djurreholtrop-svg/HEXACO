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

/**
 * Mapping from Qualtrics embedded data suffixes to API source values.
 *   _S → self, _A → ai, _O → other
 */
const QUALTRICS_SUFFIX_TO_SOURCE: Record<string, Source> = {
  _S: "self",
  _A: "ai",
  _O: "other",
};

/**
 * Mapping from Qualtrics embedded data prefixes to dimension keys.
 */
const QUALTRICS_PREFIX_TO_DIMENSION: Record<string, keyof HexacoScores> = {
  HoHu: "honesty_humility",
  Emot: "emotionality",
  Extr: "extraversion",
  Agre: "agreeableness",
  Cons: "conscientiousness",
  Open: "openness",
};

const QUALTRICS_PREFIXES = Object.keys(QUALTRICS_PREFIX_TO_DIMENSION);
const QUALTRICS_SUFFIXES = Object.keys(QUALTRICS_SUFFIX_TO_SOURCE);

/**
 * Detect Qualtrics format and extract source + scores.
 * Returns null if the body is not in Qualtrics format.
 */
function parseQualtricsBody(
  body: Record<string, unknown>
): { source: Source; scores: Record<string, unknown> } | null {
  // Check if any Qualtrics-style key is present (e.g. HoHu_S, Emot_A)
  const qualtricsKeys = Object.keys(body).filter((key) =>
    QUALTRICS_PREFIXES.some((prefix) =>
      QUALTRICS_SUFFIXES.some((suffix) => key === `${prefix}${suffix}`)
    )
  );

  if (qualtricsKeys.length === 0) return null;

  // Determine the source from the suffix — all keys must share the same suffix
  const suffixes = new Set(
    qualtricsKeys.map((key) => key.slice(-2))
  );

  if (suffixes.size !== 1) return null; // Mixed suffixes — ambiguous

  const suffix = [...suffixes][0];
  const source = QUALTRICS_SUFFIX_TO_SOURCE[suffix];
  if (!source) return null;

  // Map Qualtrics keys to standard dimension keys
  const scores: Record<string, unknown> = {};
  for (const key of qualtricsKeys) {
    const prefix = key.slice(0, -2);
    const dimension = QUALTRICS_PREFIX_TO_DIMENSION[prefix];
    if (dimension) {
      scores[dimension] = body[key];
    }
  }

  return { source, scores };
}

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
 * Accepts two body formats:
 *
 * Standard format:
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
 * Qualtrics embedded data format (source is inferred from the suffix):
 * {
 *   "token": "participant-token",
 *   "HoHu_S": 3.5, "Emot_S": 2.8, "Extr_S": 4.1,
 *   "Agre_S": 3.2, "Cons_S": 4.0, "Open_S": 3.7
 * }
 * Suffixes: _S = self, _A = ai, _O = other
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

  const { token } = body;

  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid 'token'" },
      { status: 400 }
    );
  }

  // Try Qualtrics format first, fall back to standard format
  const qualtrics = parseQualtricsBody(body);
  const source: unknown = qualtrics ? qualtrics.source : body.source;
  const scoreSource: Record<string, unknown> = qualtrics
    ? qualtrics.scores
    : body;

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
    const val = validateScore(scoreSource[key]);
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

  const success = await upsertScores(
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
