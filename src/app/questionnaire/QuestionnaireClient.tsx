"use client";

import { useState, useCallback } from "react";
import {
  HEXACO_60_ITEMS,
  RESPONSE_OPTIONS,
  type Dimension,
  DIMENSION_LABELS,
} from "@/lib/hexaco-questions";

const ITEMS_PER_PAGE = 10;
const TOTAL_PAGES = Math.ceil(HEXACO_60_ITEMS.length / ITEMS_PER_PAGE);

interface Props {
  token: string;
  source: "self" | "other";
  alreadyCompleted: boolean;
}

export default function QuestionnaireClient({
  token,
  source,
  alreadyCompleted,
}: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyCompleted);
  const [scores, setScores] = useState<Record<Dimension, number> | null>(null);

  const pageItems = HEXACO_60_ITEMS.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / HEXACO_60_ITEMS.length) * 100);

  const allPageAnswered = pageItems.every(
    (item) => answers[item.number] !== undefined
  );
  const allAnswered = answeredCount === HEXACO_60_ITEMS.length;
  const isLastPage = page === TOTAL_PAGES - 1;

  const setAnswer = useCallback((itemNumber: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [itemNumber]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, source, answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      setScores(data.scores);
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Already-completed / success state ---
  if (done) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
          &#10003;
        </div>
        <h1 className="text-2xl font-bold">
          {alreadyCompleted && !scores
            ? "Questionnaire already completed"
            : "Thank you!"}
        </h1>
        <p className="text-gray-500">
          {alreadyCompleted && !scores
            ? `The ${source === "self" ? "self-report" : "other-report"} questionnaire has already been submitted for this participant.`
            : "Your responses have been recorded successfully."}
        </p>

        {scores && (
          <div className="rounded-lg border bg-white p-6 text-left">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Your HEXACO-60 Scores
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.entries(scores) as [Dimension, number][]).map(
                ([dim, score]) => (
                  <div
                    key={dim}
                    className="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
                  >
                    <span className="text-sm font-medium">
                      {DIMENSION_LABELS[dim]}
                    </span>
                    <span className="text-sm font-bold">{score.toFixed(2)}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <a
          href={`/dashboard?token=${token}`}
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          View your dashboard
        </a>
      </div>
    );
  }

  // --- Questionnaire form ---
  return (
    <div className="py-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          HEXACO-60 {source === "self" ? "Self-Report" : "Other-Report"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {source === "self"
            ? "Please read each statement and indicate how much you agree or disagree as it applies to you."
            : "Please read each statement and indicate how much you agree or disagree as it applies to the person you are rating."}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>
            {answeredCount} of {HEXACO_60_ITEMS.length} answered
          </span>
          <span>Page {page + 1} of {TOTAL_PAGES}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {pageItems.map((item, idx) => (
          <div
            key={item.number}
            className="rounded-lg border bg-white p-4 space-y-3"
          >
            <p className="text-sm">
              <span className="font-medium text-gray-400 mr-2">
                {item.number}.
              </span>
              {item.text}
            </p>
            <div className="flex flex-wrap gap-2">
              {RESPONSE_OPTIONS.map((opt) => {
                const selected = answers[item.number] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(item.number, opt.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {isLastPage ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(TOTAL_PAGES - 1, p + 1))}
            disabled={!allPageAnswered}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Unanswered hint on last page */}
      {isLastPage && !allAnswered && (
        <p className="text-xs text-gray-400 text-center">
          Please answer all {HEXACO_60_ITEMS.length} questions before submitting.
          You have {HEXACO_60_ITEMS.length - answeredCount} remaining.
        </p>
      )}
    </div>
  );
}
