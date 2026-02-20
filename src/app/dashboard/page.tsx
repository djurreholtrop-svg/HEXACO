import { getParticipantByToken } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const data = getParticipantByToken(token);

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

  const scoreSets = data.scores.map((s) => ({
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

  const completedSources = data.scores.map((s) => s.source);

  return (
    <DashboardClient
      label={data.label}
      scoreSets={scoreSets}
      completedSources={completedSources}
    />
  );
}
