"use client";

import AgreementCards from "@/components/AgreementCards";
import HexacoRadarChart from "@/components/HexacoRadarChart";
import ScoreTable from "@/components/ScoreTable";
import ShareResults from "@/components/ShareResults";
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

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Understanding the HEXACO Dimensions
            </h2>
            <div className="rounded-lg border bg-white p-6">
              <p className="text-sm text-gray-600 mb-4">
                The HEXACO model captures six broad dimensions of personality.
                Each score ranges from 1 (low) to 5 (high).
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    letter: "H",
                    name: "Honesty-Humility",
                    desc: "People with high scores tend to be sincere, fair, modest, and unassuming. Those with lower scores may be more willing to bend rules for personal gain and are more interested in status and luxury.",
                  },
                  {
                    letter: "E",
                    name: "Emotionality",
                    desc: "High scorers experience more fear, anxiety, and emotional sensitivity. They feel a strong need for emotional support from others. Low scorers feel more emotionally detached and self-assured.",
                  },
                  {
                    letter: "X",
                    name: "Extraversion",
                    desc: "High scorers feel confident, socially bold, and energetic in social situations. Low scorers tend to feel more reserved, quiet, and less enthusiastic in groups.",
                  },
                  {
                    letter: "A",
                    name: "Agreeableness",
                    desc: "High scorers are forgiving, gentle, flexible, and patient with others. Low scorers tend to hold grudges, be more critical, and are more willing to engage in conflict.",
                  },
                  {
                    letter: "C",
                    name: "Conscientiousness",
                    desc: "High scorers are organized, disciplined, thorough, and careful in making decisions. Low scorers tend to be more spontaneous, flexible with rules, and less focused on precision.",
                  },
                  {
                    letter: "O",
                    name: "Openness to Experience",
                    desc: "High scorers are curious, creative, and drawn to unusual ideas and experiences. Low scorers tend to prefer the familiar and practical over the abstract and unconventional.",
                  },
                ].map((d) => (
                  <div key={d.letter} className="flex gap-3 items-start">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-bold">
                      {d.letter}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <ShareResults />

          <div className="text-center">
            <a
              href="https://hexaco.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg border bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              Visit HEXACO.org, the official HEXACO website, to learn more about
              the HEXACO personality model or take a more detailed HEXACO
              personality inventory.
            </a>
          </div>
        </>
      )}
    </div>
  );
}
