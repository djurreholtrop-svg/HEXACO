"use client";

const DIMENSION_KEYS = [
  "honesty_humility",
  "emotionality",
  "extraversion",
  "agreeableness",
  "conscientiousness",
  "openness",
] as const;

type DimensionKey = (typeof DIMENSION_KEYS)[number];

interface ScoreSet {
  source: string;
  scores: Record<DimensionKey, number>;
}

interface Props {
  scoreSets: ScoreSet[];
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return NaN;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0);
  const sumY2 = y.reduce((a, yi) => a + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return NaN;
  return numerator / denominator;
}

function getScoresArray(set: ScoreSet): number[] {
  return DIMENSION_KEYS.map((key) => set.scores[key]);
}

function getCorrelationLabel(r: number): { text: string; color: string } {
  const abs = Math.abs(r);
  if (abs <= 0.10) return { text: "very low", color: "text-red-500" };
  if (abs <= 0.20) return { text: "low", color: "text-orange-500" };
  if (abs <= 0.40) return { text: "medium", color: "text-yellow-600" };
  if (abs <= 0.60) return { text: "high", color: "text-green-500" };
  return { text: "very high", color: "text-green-600" };
}

const PAIRS: {
  sourceA: string;
  sourceB: string;
  label: string;
}[] = [
  { sourceA: "self", sourceB: "ai", label: "Self\u2013Agent agreement" },
  { sourceA: "self", sourceB: "other", label: "Self\u2013Other human agreement" },
  { sourceA: "other", sourceB: "ai", label: "Other human\u2013Agent agreement" },
];

export default function AgreementCards({ scoreSets }: Props) {
  const bySource: Record<string, ScoreSet> = {};
  for (const set of scoreSets) {
    bySource[set.source] = set;
  }

  const results = PAIRS.map((pair) => {
    const a = bySource[pair.sourceA];
    const b = bySource[pair.sourceB];
    if (!a || !b) return { ...pair, r: null };
    const r = pearsonCorrelation(getScoresArray(a), getScoresArray(b));
    return { ...pair, r };
  });

  // Only show if at least one pair can be computed
  const hasAny = results.some((r) => r.r !== null);
  if (!hasAny) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Profile Agreement</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {results.map((result) => (
          <div
            key={result.label}
            className="rounded-lg border bg-white p-4 text-center"
          >
            <p className="text-sm font-medium text-gray-600 mb-2">
              {result.label}
            </p>
            {result.r !== null ? (
              <>
                <p className="text-2xl font-bold tabular-nums">
                  r = {result.r.toFixed(2)}
                </p>
                <p className={`text-sm font-medium mt-1 ${getCorrelationLabel(result.r).color}`}>
                  ({getCorrelationLabel(result.r).text})
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Awaiting data</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
