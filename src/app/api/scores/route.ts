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
 *
 * Qualtrics Web Service often sends ALL embedded data fields at once, so the
 * body may contain a mix of suffixes (e.g. both _S and _A keys). When that
 * happens we pick the suffix whose keys carry the most non-empty values,
 * which corresponds to the source that was just filled in.
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

  // Group keys by suffix and count how many have non-empty, valid-looking values
  const suffixGroups: Record<string, string[]> = {};
  for (const key of qualtricsKeys) {
    const suffix = key.slice(-2);
    if (!suffixGroups[suffix]) suffixGroups[suffix] = [];
    suffixGroups[suffix].push(key);
  }

  // If an explicit "source" field is provided, prefer the matching suffix
  const explicitSource = typeof body.source === "string" ? body.source.trim() : null;
  const SOURCE_TO_SUFFIX: Record<string, string> = { self: "_S", ai: "_A", other: "_O" };
  let bestSuffix: string | null = null;

  if (explicitSource && SOURCE_TO_SUFFIX[explicitSource]) {
    const preferred = SOURCE_TO_SUFFIX[explicitSource];
    if (suffixGroups[preferred]) {
      bestSuffix = preferred;
    }
  }

  // Otherwise pick the suffix with the most valid numeric scores (1-5).
  // Qualtrics sends all embedded data, so previously-filled _S fields may
  // also have values. Counting valid scores (not just non-empty) helps
  // distinguish freshly computed values from empty/zero placeholders.
  if (!bestSuffix) {
    let bestCount = -1;
    for (const [suffix, keys] of Object.entries(suffixGroups)) {
      const validCount = keys.filter((k) => {
        const n = Number(body[k]);
        return !isNaN(n) && n >= 1 && n <= 5;
      }).length;
      if (validCount > bestCount) {
        bestCount = validCount;
        bestSuffix = suffix;
      }
    }
  }

  if (!bestSuffix) return null;

  const source = QUALTRICS_SUFFIX_TO_SOURCE[bestSuffix];
  if (!source) return null;

  // Map Qualtrics keys to standard dimension keys (only for the chosen suffix)
  const scores: Record<string, unknown> = {};
  for (const key of suffixGroups[bestSuffix]) {
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
 * Parse the request body, accepting both JSON and form-encoded data.
 * Qualtrics Web Service sends body parameters as
 * application/x-www-form-urlencoded by default.
 */
async function parseRequestBody(
  request: NextRequest
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const obj: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  // Default: try JSON
  return (await request.json()) as Record<string, unknown>;
}

/**
 * Resolve the participant token from the request.
 *
 * Checks (in order):
 *   1. body.token  (exact case)
 *   2. body.Token  (capital-T — common Qualtrics variant)
 *   3. ?token= query parameter
 *
 * Returns the trimmed token string, or null if not found.
 */
function resolveToken(
  body: Record<string, unknown>,
  request: NextRequest
): string | null {
  // Check body fields (case-insensitive for common variants)
  for (const key of Object.keys(body)) {
    if (key.toLowerCase() === "token") {
      const val = body[key];
      if (typeof val === "string" && val.trim()) return val.trim();
    }
  }

  // Fallback: check URL query parameter
  const queryToken = request.nextUrl.searchParams.get("token");
  if (queryToken && queryToken.trim()) return queryToken.trim();

  return null;
}

/**
 * POST /api/scores
 *
 * Receives HEXACO-60 dimension scores from Qualtrics.
 *
 * Headers:
 *   X-API-Key: <API_SECRET_KEY>
 *
 * Accepts body as JSON or application/x-www-form-urlencoded.
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
 * The token can be provided in the body (as "token" or "Token") or as a
 * ?token= query parameter. All dimension scores should be between 1.0 and 5.0.
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
    body = await parseRequestBody(request);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Log incoming payload for debugging Qualtrics integration
  console.log("[POST /api/scores] content-type:", request.headers.get("content-type"));
  console.log("[POST /api/scores] query params:", Object.fromEntries(request.nextUrl.searchParams));
  console.log("[POST /api/scores] body keys:", Object.keys(body));
  console.log("[POST /api/scores] body:", JSON.stringify(body));

  const token = resolveToken(body, request);

  if (!token) {
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
