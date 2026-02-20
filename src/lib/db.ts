import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "hexaco.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    migrate(_db);
  }
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      label TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('self', 'ai', 'other')),
      honesty_humility REAL NOT NULL,
      emotionality REAL NOT NULL,
      extraversion REAL NOT NULL,
      agreeableness REAL NOT NULL,
      conscientiousness REAL NOT NULL,
      openness REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (participant_id) REFERENCES participants(id),
      UNIQUE(participant_id, source)
    );
  `);
}

export function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function createParticipant(label?: string): {
  id: number;
  token: string;
} {
  const db = getDb();
  const token = generateToken();
  const result = db
    .prepare("INSERT INTO participants (token, label) VALUES (?, ?)")
    .run(token, label ?? null);
  return { id: result.lastInsertRowid as number, token };
}

export interface HexacoScores {
  honesty_humility: number;
  emotionality: number;
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  openness: number;
}

export type Source = "self" | "ai" | "other";

export function upsertScores(
  token: string,
  source: Source,
  scores: HexacoScores
): boolean {
  const db = getDb();
  const participant = db
    .prepare("SELECT id FROM participants WHERE token = ?")
    .get(token) as { id: number } | undefined;

  if (!participant) return false;

  db.prepare(
    `INSERT INTO scores (participant_id, source, honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(participant_id, source) DO UPDATE SET
       honesty_humility = excluded.honesty_humility,
       emotionality = excluded.emotionality,
       extraversion = excluded.extraversion,
       agreeableness = excluded.agreeableness,
       conscientiousness = excluded.conscientiousness,
       openness = excluded.openness,
       created_at = datetime('now')`
  ).run(
    participant.id,
    source,
    scores.honesty_humility,
    scores.emotionality,
    scores.extraversion,
    scores.agreeableness,
    scores.conscientiousness,
    scores.openness
  );

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
    created_at: string;
  }[];
}

export function getParticipantByToken(
  token: string
): ParticipantData | null {
  const db = getDb();
  const participant = db
    .prepare("SELECT id, token, label, created_at FROM participants WHERE token = ?")
    .get(token) as
    | { id: number; token: string; label: string | null; created_at: string }
    | undefined;

  if (!participant) return null;

  const scores = db
    .prepare(
      "SELECT source, honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness, created_at FROM scores WHERE participant_id = ? ORDER BY source"
    )
    .all(participant.id) as ParticipantData["scores"];

  return {
    token: participant.token,
    label: participant.label,
    created_at: participant.created_at,
    scores,
  };
}

export function listParticipants(): {
  id: number;
  token: string;
  label: string | null;
  created_at: string;
  score_count: number;
}[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT p.id, p.token, p.label, p.created_at,
              (SELECT COUNT(*) FROM scores s WHERE s.participant_id = p.id) as score_count
       FROM participants p ORDER BY p.created_at DESC`
    )
    .all() as {
    id: number;
    token: string;
    label: string | null;
    created_at: string;
    score_count: number;
  }[];
}
