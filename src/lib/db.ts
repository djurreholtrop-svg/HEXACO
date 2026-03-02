import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

function getSQL() {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Missing POSTGRES_URL or DATABASE_URL environment variable"
    );
  }
  return neon(databaseUrl, { fetchOptions: { cache: "no-store" } });
}

// Auto-migration: runs once per cold start to ensure schema is up-to-date
let migrated = false;

export async function ensureMigrated() {
  if (migrated) return;
  await migrate();
  migrated = true;
}

export async function migrate() {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      label TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      participant_id INTEGER NOT NULL REFERENCES participants(id),
      source TEXT NOT NULL CHECK(source IN ('self', 'ai', 'other')),
      honesty_humility REAL NOT NULL,
      emotionality REAL NOT NULL,
      extraversion REAL NOT NULL,
      agreeableness REAL NOT NULL,
      conscientiousness REAL NOT NULL,
      openness REAL NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(participant_id, source)
    )
  `;
  // Add stanine columns (only populated for self-report scores)
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS honesty_humility_stanine REAL`;
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS emotionality_stanine REAL`;
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS extraversion_stanine REAL`;
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS agreeableness_stanine REAL`;
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS conscientiousness_stanine REAL`;
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS openness_stanine REAL`;
}

export function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function createParticipant(label?: string): Promise<{
  id: number;
  token: string;
}> {
  const sql = getSQL();
  const token = generateToken();
  const rows = await sql`
    INSERT INTO participants (token, label)
    VALUES (${token}, ${label ?? null})
    RETURNING id
  `;
  return { id: rows[0].id, token };
}

export interface HexacoScores {
  honesty_humility: number;
  emotionality: number;
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  openness: number;
}

export interface HexacoStanineScores {
  honesty_humility_stanine: number;
  emotionality_stanine: number;
  extraversion_stanine: number;
  agreeableness_stanine: number;
  conscientiousness_stanine: number;
  openness_stanine: number;
}

export type Source = "self" | "ai" | "other";

export async function upsertScores(
  token: string,
  source: Source,
  scores: HexacoScores,
  stanineScores?: HexacoStanineScores
): Promise<boolean> {
  await ensureMigrated();
  const sql = getSQL();
  let participants = await sql`
    SELECT id FROM participants WHERE token = ${token}
  `;

  // Auto-create participant if the token doesn't exist yet
  if (participants.length === 0) {
    participants = await sql`
      INSERT INTO participants (token)
      VALUES (${token})
      ON CONFLICT (token) DO NOTHING
      RETURNING id
    `;
    // If ON CONFLICT hit (race condition), fetch the existing row
    if (participants.length === 0) {
      participants = await sql`
        SELECT id FROM participants WHERE token = ${token}
      `;
    }
  }

  const participantId = participants[0].id;

  const hStan = stanineScores?.honesty_humility_stanine ?? null;
  const eStan = stanineScores?.emotionality_stanine ?? null;
  const xStan = stanineScores?.extraversion_stanine ?? null;
  const aStan = stanineScores?.agreeableness_stanine ?? null;
  const cStan = stanineScores?.conscientiousness_stanine ?? null;
  const oStan = stanineScores?.openness_stanine ?? null;

  await sql`
    INSERT INTO scores (
      participant_id, source,
      honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness,
      honesty_humility_stanine, emotionality_stanine, extraversion_stanine, agreeableness_stanine, conscientiousness_stanine, openness_stanine
    )
    VALUES (
      ${participantId}, ${source},
      ${scores.honesty_humility}, ${scores.emotionality}, ${scores.extraversion}, ${scores.agreeableness}, ${scores.conscientiousness}, ${scores.openness},
      ${hStan}, ${eStan}, ${xStan}, ${aStan}, ${cStan}, ${oStan}
    )
    ON CONFLICT(participant_id, source) DO UPDATE SET
      honesty_humility = EXCLUDED.honesty_humility,
      emotionality = EXCLUDED.emotionality,
      extraversion = EXCLUDED.extraversion,
      agreeableness = EXCLUDED.agreeableness,
      conscientiousness = EXCLUDED.conscientiousness,
      openness = EXCLUDED.openness,
      honesty_humility_stanine = EXCLUDED.honesty_humility_stanine,
      emotionality_stanine = EXCLUDED.emotionality_stanine,
      extraversion_stanine = EXCLUDED.extraversion_stanine,
      agreeableness_stanine = EXCLUDED.agreeableness_stanine,
      conscientiousness_stanine = EXCLUDED.conscientiousness_stanine,
      openness_stanine = EXCLUDED.openness_stanine,
      created_at = NOW()
  `;

  return true;
}

export interface ParticipantData {
  token: string;
  label: string | null;
  created_at: string;
  scores: {
    source: Source;
    honesty_humility: number;
    emotionality: number;
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
    openness: number;
    honesty_humility_stanine: number | null;
    emotionality_stanine: number | null;
    extraversion_stanine: number | null;
    agreeableness_stanine: number | null;
    conscientiousness_stanine: number | null;
    openness_stanine: number | null;
    created_at: string;
  }[];
}

export async function getParticipantByToken(
  token: string
): Promise<ParticipantData | null> {
  await ensureMigrated();
  const sql = getSQL();
  const participants = await sql`
    SELECT id, token, label, created_at FROM participants WHERE token = ${token}
  `;

  if (participants.length === 0) return null;

  const participant = participants[0];

  const scores = await sql`
    SELECT source,
      honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness,
      honesty_humility_stanine, emotionality_stanine, extraversion_stanine, agreeableness_stanine, conscientiousness_stanine, openness_stanine,
      created_at
    FROM scores
    WHERE participant_id = ${participant.id}
    ORDER BY source
  `;

  return {
    token: participant.token,
    label: participant.label,
    created_at: participant.created_at,
    scores: scores.map((s) => ({
      source: s.source as Source,
      honesty_humility: Number(s.honesty_humility),
      emotionality: Number(s.emotionality),
      extraversion: Number(s.extraversion),
      agreeableness: Number(s.agreeableness),
      conscientiousness: Number(s.conscientiousness),
      openness: Number(s.openness),
      honesty_humility_stanine: s.honesty_humility_stanine != null ? Number(s.honesty_humility_stanine) : null,
      emotionality_stanine: s.emotionality_stanine != null ? Number(s.emotionality_stanine) : null,
      extraversion_stanine: s.extraversion_stanine != null ? Number(s.extraversion_stanine) : null,
      agreeableness_stanine: s.agreeableness_stanine != null ? Number(s.agreeableness_stanine) : null,
      conscientiousness_stanine: s.conscientiousness_stanine != null ? Number(s.conscientiousness_stanine) : null,
      openness_stanine: s.openness_stanine != null ? Number(s.openness_stanine) : null,
      created_at: s.created_at,
    })),
  };
}

export async function listParticipants(): Promise<
  {
    id: number;
    token: string;
    label: string | null;
    created_at: string;
    score_count: number;
  }[]
> {
  const sql = getSQL();
  const rows = await sql`
    SELECT p.id, p.token, p.label, p.created_at,
           (SELECT COUNT(*) FROM scores s WHERE s.participant_id = p.id) as score_count
    FROM participants p
    ORDER BY p.created_at DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    token: row.token,
    label: row.label,
    created_at: row.created_at,
    score_count: Number(row.score_count),
  }));
}
