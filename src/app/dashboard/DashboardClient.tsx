"use client";

import AgreementCards from "@/components/AgreementCards";
import HexacoRadarChart from "@/components/HexacoRadarChart";
import ScoreTable from "@/components/ScoreTable";
import StatusCards from "@/components/StatusCards";

interface ScoreSet {
  source: string;
  scores: {
    honesty_humility: number;
    emotionality: number;
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
    openness: number;
  };
}

interface Props {
  label: string | null;
  scoreSets: ScoreSet[];
  completedSources: string[];
}

export default function DashboardClient({
  label,
  scoreSets,
  completedSources,
}: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {label ? `${label} — Personality Profile` : "Your Personality Profile"}
        </h1>
        <p className="mt-1 text-gray-500">
          HEXACO-60 scores from up to three sources: self-report, AI agent, and
          a close other.
        </p>
      </div>

      <StatusCards completedSources={completedSources} />

      {scoreSets.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-400 text-lg">
            No scores have been submitted yet.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Scores will appear here as each questionnaire is completed.
          </p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Personality Radar Chart
            </h2>
            <div className="rounded-lg border bg-white p-4">
              <HexacoRadarChart scoreSets={scoreSets} />
            </div>
          </section>

          <AgreementCards scoreSets={scoreSets} />

          <section>
            <h2 className="text-lg font-semibold mb-4">Score Details</h2>
            <div className="rounded-lg border bg-white p-4">
              <ScoreTable rows={scoreSets} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
