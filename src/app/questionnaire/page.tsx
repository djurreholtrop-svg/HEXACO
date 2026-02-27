import { getParticipantByToken } from "@/lib/db";
import { redirect } from "next/navigation";
import QuestionnaireClient from "./QuestionnaireClient";

interface Props {
  searchParams: Promise<{ token?: string; source?: string }>;
}

export default async function QuestionnairePage({ searchParams }: Props) {
  const { token, source } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const validSource = source === "other" ? "other" : "self";

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

  const alreadyCompleted = data.scores.some((s) => s.source === validSource);

  return (
    <QuestionnaireClient
      token={token}
      source={validSource}
      alreadyCompleted={alreadyCompleted}
    />
  );
}
