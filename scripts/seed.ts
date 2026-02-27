/**
 * Seed script — creates a demo participant with HEXACO scores from all three sources.
 *
 * Usage:  POSTGRES_URL="your-connection-string" npx tsx scripts/seed.ts
 */
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

async function seed() {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Set POSTGRES_URL or DATABASE_URL environment variable");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  // Create tables if they don't exist
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

  const token = crypto.randomBytes(16).toString("hex");

  const rows = await sql`
    INSERT INTO participants (token, label)
    VALUES (${token}, ${"Demo Participant"})
    RETURNING id
  `;
  const participantId = rows[0].id;

  // Realistic HEXACO-60 scores (scale 1–5)
  const scoreSets = [
    {
      source: "self",
      honesty_humility: 3.8,
      emotionality: 2.9,
      extraversion: 3.5,
      agreeableness: 3.2,
      conscientiousness: 4.1,
      openness: 3.7,
    },
    {
      source: "ai",
      honesty_humility: 3.6,
      emotionality: 3.1,
      extraversion: 3.3,
      agreeableness: 3.5,
      conscientiousness: 3.9,
      openness: 3.8,
    },
    {
      source: "other",
      honesty_humility: 4.0,
      emotionality: 2.5,
      extraversion: 3.8,
      agreeableness: 2.9,
      conscientiousness: 4.3,
      openness: 3.4,
    },
  ];

  for (const s of scoreSets) {
    await sql`
      INSERT INTO scores (participant_id, source, honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness)
      VALUES (${participantId}, ${s.source}, ${s.honesty_humility}, ${s.emotionality}, ${s.extraversion}, ${s.agreeableness}, ${s.conscientiousness}, ${s.openness})
    `;
  }

  console.log("Seed complete!");
  console.log(`Token: ${token}`);
  console.log(`Dashboard URL: /dashboard?token=${token}`);
}

seed().catch(console.error);
