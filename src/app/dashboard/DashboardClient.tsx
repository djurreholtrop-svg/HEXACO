"use client";

import AgreementCards from "@/components/AgreementCards";
import AgreementSurvey from "@/components/AgreementSurvey";
import HexacoRadarChart from "@/components/HexacoRadarChart";
import ParticipationCTA from "@/components/ParticipationCTA";
import ScoreTable from "@/components/ScoreTable";
import ShareChart from "@/components/ShareChart";
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

type DashboardView = "self-ai" | "self-other" | "full";

interface StanineScores {
  honesty_humility: number;
  emotionality: number;
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  openness: number;
}

interface Props {
  token: string;
  label: string | null;
  scoreSets: ScoreSet[];
  selfStanineScores: StanineScores | null;
  completedSources: string[];
  view: DashboardView;
  isShared: boolean;
}

const VIEW_SOURCES: Record<DashboardView, string[]> = {
  "self-ai": ["self", "ai"],
  "self-other": ["self", "other"],
  full: ["self", "ai", "other"],
};

export default function DashboardClient({
  token,
  label,
  scoreSets,
  selfStanineScores,
  completedSources,
  view,
  isShared,
}: Props) {
  const visibleSources = VIEW_SOURCES[view];
  const hasAiScores = completedSources.includes("ai");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {label ? `${label} — Your personality dashboard` : "Your personality dashboard"}
        </h1>
        <p className="mt-1 text-gray-500">
          HEXACO-60 scores from up to three sources: self-report, AI agent,
          and a close other. The meaning of the dimensions is explained at the
          bottom of this page.
        </p>
      </div>

      <StatusCards
        completedSources={completedSources}
        visibleSources={visibleSources}
      />

      {scoreSets.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-400 text-lg">
            No scores have been submitted yet.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Scores will appear here once they have been submitted.
          </p>
        </div>
      ) : (
        <>
          {/* ── Part 1: Your personality profile agreement ── */}
          <div className="border-b pb-2">
            <h2 className="text-xl font-bold">Your personality profile agreement</h2>
            <p className="text-sm text-gray-500 mt-1">
              How well do your different personality assessments agree with each other?
            </p>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Personality Radar Chart
            </h2>
            <ShareChart>
              <HexacoRadarChart scoreSets={scoreSets} domain={[1, 5]} />
            </ShareChart>
          </section>

          <AgreementCards scoreSets={scoreSets} />

          <section>
            <h2 className="text-lg font-semibold mb-4">Score Details</h2>
            <div className="rounded-lg border bg-white p-4">
              <ScoreTable rows={scoreSets} />
            </div>
          </section>

          {/* ── Part 2: Your personality levels ── */}
          {selfStanineScores && (
            <>
              <div className="border-b pb-2 mt-4">
                <h2 className="text-xl font-bold">Your personality levels</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your self-report scores converted to stanine scores so you can see where you fall relative to others.
                </p>
              </div>

              <section>
                <h2 className="text-lg font-semibold mb-4">
                  Your stanine scores
                </h2>
                <div className="rounded-lg border bg-white p-4">
                  <HexacoRadarChart
                    scoreSets={[
                      { source: "self", scores: selfStanineScores },
                    ]}
                    domain={[1, 9]}
                  />
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-4">
                  What do your stanine scores mean?
                </h2>
                <div className="rounded-lg border bg-white p-6">
                  <p className="text-sm text-gray-600 mb-3">
                    Your scores are shown as <strong>stanine scores</strong>, which
                    range from <strong>1</strong> (lowest) to <strong>9</strong>{" "}
                    (highest). &ldquo;Stanine&rdquo; stands for{" "}
                    <strong>sta</strong>ndard <strong>nine</strong> — a simple way to
                    compare your scores to the general population.
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    A stanine of <strong>5</strong> is exactly average. Scores of 4,
                    5, or 6 are in the middle range and are considered typical. Scores
                    of 1, 2, or 3 are below average, while scores of 7, 8, or 9 are
                    above average.
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Think of it like a 9-point ladder: most people cluster in the
                    middle rungs, with fewer people at the very top or bottom.
                  </p>
                  <p className="text-sm text-gray-600">
                    For example, if your AI-agent score for Extraversion
                    is &lsquo;8&rsquo; it means that your AI-agent rated you as high
                    on extraversion.
                  </p>
                </div>
              </section>
            </>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Understanding the HEXACO Dimensions
            </h2>
            <div className="rounded-lg border bg-white p-6">
              <p className="text-sm text-gray-600 mb-4">
                The HEXACO model captures six broad dimensions of personality.
                Each stanine score ranges from 1 (low) to 9 (high). High or low
                scores are not necessarily good or bad. These are average
                behavior tendencies that can be adaptive in different situations.
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

      {hasAiScores && !isShared && <AgreementSurvey token={token} />}
      {isShared && <ParticipationCTA />}
    </div>
  );
}
