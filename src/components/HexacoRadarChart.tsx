"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DIMENSIONS = [
  { key: "honesty_humility", label: "Honesty-Humility" },
  { key: "emotionality", label: "Emotionality" },
  { key: "extraversion", label: "Extraversion" },
  { key: "agreeableness", label: "Agreeableness" },
  { key: "conscientiousness", label: "Conscientiousness" },
  { key: "openness", label: "Openness" },
] as const;

type DimensionKey = (typeof DIMENSIONS)[number]["key"];

interface ScoreSet {
  source: string;
  scores: Record<DimensionKey, number>;
}

const SOURCE_COLORS: Record<string, string> = {
  self: "#3b82f6",
  ai: "#8b5cf6",
  other: "#f59e0b",
};

const SOURCE_LABELS: Record<string, string> = {
  self: "Self-report",
  ai: "AI Agent",
  other: "Close Other",
};

interface Props {
  scoreSets: ScoreSet[];
}

export default function HexacoRadarChart({ scoreSets }: Props) {
  const data = DIMENSIONS.map((dim) => {
    const point: Record<string, string | number> = { dimension: dim.label };
    for (const set of scoreSets) {
      point[set.source] = set.scores[dim.key];
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 13 }} />
        <PolarRadiusAxis domain={[1, 5]} tickCount={5} />
        {scoreSets.map((set) => (
          <Radar
            key={set.source}
            name={SOURCE_LABELS[set.source] ?? set.source}
            dataKey={set.source}
            stroke={SOURCE_COLORS[set.source] ?? "#888"}
            fill={SOURCE_COLORS[set.source] ?? "#888"}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
