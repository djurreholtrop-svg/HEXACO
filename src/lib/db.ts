import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "hexaco.db");

let _db: SqlJsDatabase | null = null;
let _initPromise: Promise<SqlJsDatabase> | null = null;

function saveDb(db: SqlJsDatabase) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function getDb(): Promise<SqlJsDatabase> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      _db = new SQL.Database(fileBuffer);
    } else {
      _db = new SQL.Database();
    }

    _db.run("PRAGMA foreign_keys = ON;");
    migrate(_db);
    saveDb(_db);
    return _db;
  })();

  return _initPromise;
}

function migrate(db: SqlJsDatabase) {
  db.run(`
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

export async function createParticipant(label?: string): Promise<{
  id: number;
  token: string;
}> {
  const db = await getDb();
  const token = generateToken();
  db.run("INSERT INTO participants (token, label) VALUES (?, ?)", [
    token,
    label ?? null,
  ]);
  const result = db.exec("SELECT last_insert_rowid() as id");
  const id = result[0].values[0][0] as number;
  saveDb(db);
  return { id, token };
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

export async function upsertScores(
  token: string,
  source: Source,
  scores: HexacoScores
): Promise<boolean> {
  const db = await getDb();
  const stmt = db.prepare("SELECT id FROM participants WHERE token = ?");
  stmt.bind([token]);

  if (!stmt.step()) {
    stmt.free();
    return false;
  }

  const participantId = stmt.get()[0] as number;
  stmt.free();

  db.run(
    `INSERT INTO scores (participant_id, source, honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(participant_id, source) DO UPDATE SET
       honesty_humility = excluded.honesty_humility,
       emotionality = excluded.emotionality,
       extraversion = excluded.extraversion,
       agreeableness = excluded.agreeableness,
       conscientiousness = excluded.conscientiousness,
       openness = excluded.openness,
       created_at = datetime('now')`,
    [
      participantId,
      source,
      scores.honesty_humility,
      scores.emotionality,
      scores.extraversion,
      scores.agreeableness,
      scores.conscientiousness,
      scores.openness,
    ]
  );

  saveDb(db);
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

export async function getParticipantByToken(
  token: string
): Promise<ParticipantData | null> {
  const db = await getDb();
  const pStmt = db.prepare(
    "SELECT id, token, label, created_at FROM participants WHERE token = ?"
  );
  pStmt.bind([token]);

  if (!pStmt.step()) {
    pStmt.free();
    return null;
  }

  const row = pStmt.getAsObject();
  pStmt.free();

  const participantId = row.id as number;

  const sStmt = db.prepare(
    "SELECT source, honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness, created_at FROM scores WHERE participant_id = ? ORDER BY source"
  );
  sStmt.bind([participantId]);

  const scores: ParticipantData["scores"] = [];
  while (sStmt.step()) {
    const s = sStmt.getAsObject();
    scores.push({
      source: s.source as Source,
      honesty_humility: s.honesty_humility as number,
      emotionality: s.emotionality as number,
      extraversion: s.extraversion as number,
      agreeableness: s.agreeableness as number,
      conscientiousness: s.conscientiousness as number,
      openness: s.openness as number,
      created_at: s.created_at as string,
    });
  }
  sStmt.free();

  return {
    token: row.token as string,
    label: row.label as string | null,
    created_at: row.created_at as string,
    scores,
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
  const db = await getDb();
  const results = db.exec(
    `SELECT p.id, p.token, p.label, p.created_at,
            (SELECT COUNT(*) FROM scores s WHERE s.participant_id = p.id) as score_count
     FROM participants p ORDER BY p.created_at DESC`
  );

  if (!results.length || !results[0].values.length) return [];

  return results[0].values.map((row) => ({
    id: row[0] as number,
    token: row[1] as string,
    label: row[2] as string | null,
    created_at: row[3] as string,
    score_count: row[4] as number,
  }));
}
