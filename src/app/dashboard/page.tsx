import { getParticipantByToken } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

/**
 * Dashboard view modes:
 *   self-ai    — show only Self-report and AI Agent scores
 *   self-other — show only Self-report and Close Other scores
 *   full       — show all three sources (default)
 */
type DashboardView = "self-ai" | "self-other" | "full";

const VIEW_SOURCES: Record<DashboardView, string[]> = {
  "self-ai": ["self", "ai"],
  "self-other": ["self", "other"],
  full: ["self", "ai", "other"],
};

interface Props {
  searchParams: Promise<{ token?: string; view?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { token, view: rawView } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const view: DashboardView =
    rawView === "self-ai" || rawView === "self-other" ? rawView : "full";

  const allowedSources = VIEW_SOURCES[view];

  const data = await getParticipantByToken(token);

  if (!data) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Participant not found</h1>
        <p className="text-gray-500">
          The token in your link does not match any participant. Please check
          your URL.
        </p>
      </div>
    );
  }

  const scoreSets = data.scores
    .filter((s) => allowedSources.includes(s.source))
    .map((s) => ({
      source: s.source,
      scores: {
        honesty_humility: s.honesty_humility,
        emotionality: s.emotionality,
        extraversion: s.extraversion,
        agreeableness: s.agreeableness,
        conscientiousness: s.conscientiousness,
        openness: s.openness,
      },
    }));

  // Extract self-report stanine scores (if available)
  const selfRow = data.scores.find((s) => s.source === "self");
  const selfStanineScores =
    selfRow &&
    selfRow.honesty_humility_stanine != null &&
    selfRow.emotionality_stanine != null &&
    selfRow.extraversion_stanine != null &&
    selfRow.agreeableness_stanine != null &&
    selfRow.conscientiousness_stanine != null &&
    selfRow.openness_stanine != null
      ? {
          honesty_humility: selfRow.honesty_humility_stanine,
          emotionality: selfRow.emotionality_stanine,
          extraversion: selfRow.extraversion_stanine,
          agreeableness: selfRow.agreeableness_stanine,
          conscientiousness: selfRow.conscientiousness_stanine,
          openness: selfRow.openness_stanine,
        }
      : null;

  const completedSources = data.scores
    .filter((s) => allowedSources.includes(s.source))
    .map((s) => s.source);

  return (
    <DashboardClient
      label={data.label}
      scoreSets={scoreSets}
      selfStanineScores={selfStanineScores}
      completedSources={completedSources}
      view={view}
    />
  );
}
