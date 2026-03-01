"use client";

const DIMENSIONS = [
  { key: "honesty_humility", label: "Honesty-Humility", short: "H" },
  { key: "emotionality", label: "Emotionality", short: "E" },
  { key: "extraversion", label: "Extraversion", short: "X" },
  { key: "agreeableness", label: "Agreeableness", short: "A" },
  { key: "conscientiousness", label: "Conscientiousness", short: "C" },
  { key: "openness", label: "Openness to Experience", short: "O" },
] as const;

type DimensionKey = (typeof DIMENSIONS)[number]["key"];

interface ScoreRow {
  source: string;
  scores: Record<DimensionKey, number>;
}

const SOURCE_LABELS: Record<string, string> = {
  self: "Self-report",
  ai: "AI Agent",
  other: "Close Other",
};

const SOURCE_COLORS: Record<string, string> = {
  self: "bg-gray-200 text-black",
  ai: "bg-violet-100 text-violet-800",
  other: "bg-amber-100 text-amber-800",
};

interface Props {
  rows: ScoreRow[];
}

export default function ScoreTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4 font-medium">Source</th>
            {DIMENSIONS.map((d) => (
              <th
                key={d.key}
                className="py-2 px-3 font-medium text-center"
                title={d.label}
              >
                {d.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.source} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    SOURCE_COLORS[row.source] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {SOURCE_LABELS[row.source] ?? row.source}
                </span>
              </td>
              {DIMENSIONS.map((d) => (
                <td key={d.key} className="py-3 px-3 text-center tabular-nums">
                  {Math.round(row.scores[d.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
