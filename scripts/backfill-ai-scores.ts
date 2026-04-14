/**
 * Backfill AI-agent HEXACO scores from a CSV export.
 *
 * Expected CSV columns (header row required):
 *   token, HoHu_A, Emot_A, Extr_A, Agre_A, Cons_A, Open_A, source
 *
 * The `source` column should be "ai" for every row. Scores are means on the
 * 1-5 scale. Separator is auto-detected (comma or semicolon). If the file uses
 * semicolons, decimal commas in numeric fields are converted to dots (European
 * Excel default).
 *
 * Usage:
 *   BACKFILL_API_URL="https://hexaco-agent.vercel.app/api/scores" \
 *   BACKFILL_API_KEY="<your-key>" \
 *   npx tsx scripts/backfill-ai-scores.ts path/to/scores.csv
 *
 * Dry run (validates + prints, does not POST):
 *   npx tsx scripts/backfill-ai-scores.ts path/to/scores.csv --dry-run
 */
import fs from "fs";
import path from "path";

const API_URL =
  process.env.BACKFILL_API_URL ?? "https://hexaco-agent.vercel.app/api/scores";
const API_KEY = process.env.BACKFILL_API_KEY;

const REQUIRED_COLUMNS = [
  "token",
  "HoHu_A",
  "Emot_A",
  "Extr_A",
  "Agre_A",
  "Cons_A",
  "Open_A",
  "source",
] as const;

const SCORE_COLUMNS = [
  "HoHu_A",
  "Emot_A",
  "Extr_A",
  "Agre_A",
  "Cons_A",
  "Open_A",
] as const;

interface Row {
  token: string;
  HoHu_A: number;
  Emot_A: number;
  Extr_A: number;
  Agre_A: number;
  Cons_A: number;
  Open_A: number;
  source: string;
}

function detectSeparator(headerLine: string): "," | ";" {
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  const semiCount = (headerLine.match(/;/g) ?? []).length;
  return semiCount > commaCount ? ";" : ",";
}

function parseCsv(text: string): { rows: Row[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    errors.push("CSV must contain a header row plus at least one data row.");
    return { rows: [], errors };
  }

  const sep = detectSeparator(lines[0]);
  const header = lines[0].split(sep).map((h) => h.trim());

  for (const col of REQUIRED_COLUMNS) {
    if (!header.includes(col)) {
      errors.push(`Missing required column in header: "${col}"`);
    }
  }
  if (errors.length > 0) return { rows: [], errors };

  const idx = Object.fromEntries(
    REQUIRED_COLUMNS.map((c) => [c, header.indexOf(c)])
  );

  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i].split(sep).map((v) => v.trim());
    const token = raw[idx.token];
    if (!token) {
      errors.push(`Row ${i + 1}: empty token, skipping.`);
      continue;
    }

    const row: Partial<Row> = { token, source: raw[idx.source] };
    let bad = false;
    for (const col of SCORE_COLUMNS) {
      let val = raw[idx[col]];
      if (sep === ";") val = val.replace(",", ".");
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 5) {
        errors.push(
          `Row ${i + 1} (token=${token}): invalid ${col}="${raw[idx[col]]}" (must be 1-5)`
        );
        bad = true;
        break;
      }
      row[col] = Math.round(num * 100) / 100;
    }
    if (bad) continue;

    if ((row.source ?? "").toLowerCase() !== "ai") {
      errors.push(
        `Row ${i + 1} (token=${token}): source="${row.source}" is not "ai", skipping.`
      );
      continue;
    }
    row.source = "ai";

    rows.push(row as Row);
  }

  return { rows, errors };
}

async function postRow(row: Row): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    },
    body: JSON.stringify({
      token: row.token,
      source: "ai",
      HoHu_A: row.HoHu_A,
      Emot_A: row.Emot_A,
      Extr_A: row.Extr_A,
      Agre_A: row.Agre_A,
      Cons_A: row.Cons_A,
      Open_A: row.Open_A,
    }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("--"));

  if (!csvPath) {
    console.error(
      "Usage: npx tsx scripts/backfill-ai-scores.ts <path-to-csv> [--dry-run]"
    );
    process.exit(1);
  }

  const absPath = path.resolve(csvPath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  if (!dryRun && !API_KEY) {
    console.error(
      "Missing BACKFILL_API_KEY env var. Set it or use --dry-run to test parsing."
    );
    process.exit(1);
  }

  console.log(`Reading ${absPath}`);
  const text = fs.readFileSync(absPath, "utf-8");
  const { rows, errors } = parseCsv(text);

  if (errors.length > 0) {
    console.log(`\nParse issues (${errors.length}):`);
    for (const e of errors) console.log("  - " + e);
  }

  console.log(`\nParsed ${rows.length} valid row(s).`);
  if (rows.length === 0) process.exit(1);

  if (dryRun) {
    console.log("\n--- Dry run: first 3 rows ---");
    for (const r of rows.slice(0, 3)) console.log(JSON.stringify(r));
    console.log(`\n(${rows.length} rows total would be POSTed to ${API_URL})`);
    return;
  }

  console.log(`\nPOSTing to ${API_URL} ...\n`);
  let ok = 0;
  let fail = 0;
  const failures: Array<{ token: string; status: number; body: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const res = await postRow(row);
      if (res.ok) {
        ok++;
        console.log(`  [${i + 1}/${rows.length}] ✓ ${row.token}`);
      } else {
        fail++;
        failures.push({ token: row.token, status: res.status, body: res.body });
        console.log(
          `  [${i + 1}/${rows.length}] ✗ ${row.token} — ${res.status}: ${res.body}`
        );
      }
    } catch (err) {
      fail++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push({ token: row.token, status: 0, body: msg });
      console.log(`  [${i + 1}/${rows.length}] ✗ ${row.token} — network error: ${msg}`);
    }
    await sleep(100); // be nice to the server
  }

  console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) {
      console.log(`  - ${f.token}: [${f.status}] ${f.body}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
