/**
 * Seed script — creates a demo participant with HEXACO scores from all three sources.
 *
 * Usage:  npx tsx scripts/seed.ts
 */
import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "hexaco.db");

async function seed() {
  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON;");

  // Create tables if they don't exist
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

  const token = crypto.randomBytes(16).toString("hex");

  db.run("INSERT INTO participants (token, label) VALUES (?, ?)", [
    token,
    "Demo Participant",
  ]);

  const result = db.exec("SELECT last_insert_rowid() as id");
  const participantId = result[0].values[0][0] as number;

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
    db.run(
      `INSERT INTO scores (participant_id, source, honesty_humility, emotionality, extraversion, agreeableness, conscientiousness, openness)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        participantId,
        s.source,
        s.honesty_humility,
        s.emotionality,
        s.extraversion,
        s.agreeableness,
        s.conscientiousness,
        s.openness,
      ]
    );
  }

  // Save to disk
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();

  console.log("Seed complete!");
  console.log(`Token: ${token}`);
  console.log(`Dashboard URL: http://localhost:3001/dashboard?token=${token}`);
}

seed().catch(console.error);
