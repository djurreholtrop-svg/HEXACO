/**
 * Count agreement survey responses and print per-question averages.
 * Usage:
 *   POSTGRES_URL="postgres://..." npx tsx scripts/count-agreements.ts
 */
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing POSTGRES_URL or DATABASE_URL env var.");
  process.exit(1);
}

async function main() {
  const sql = neon(databaseUrl!);

  const rows = await sql`
    SELECT a.q1, a.q2, a.q3, a.q4, a.created_at, p.token
    FROM agreement_responses a
    JOIN participants p ON p.id = a.participant_id
    ORDER BY a.created_at DESC
  `;

  console.log(`\nTotal responses: ${rows.length}\n`);

  if (rows.length > 0) {
    const avg = (key: "q1" | "q2" | "q3" | "q4") =>
      (rows.reduce((s, r) => s + Number(r[key]), 0) / rows.length).toFixed(2);

    console.log("Average scores (1–7 scale):");
    console.log(`  Q1 (accurate evaluation):         ${avg("q1")}`);
    console.log(`  Q2 (do not agree – reverse):      ${avg("q2")}`);
    console.log(`  Q3 (hard to take seriously – rev): ${avg("q3")}`);
    console.log(`  Q4 (do not believe – reverse):    ${avg("q4")}`);

    console.log("\nRecent responses:");
    for (const r of rows.slice(0, 10)) {
      console.log(
        `  ${String(r.created_at).slice(0, 19)}  token=${r.token}  q1=${r.q1} q2=${r.q2} q3=${r.q3} q4=${r.q4}`
      );
    }
    if (rows.length > 10) console.log(`  … and ${rows.length - 10} more`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
