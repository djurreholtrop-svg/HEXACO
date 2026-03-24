"use client";

import { useEffect, useState, useCallback } from "react";

const QUESTIONS = [
  "The AI-agent ratings I received are an accurate evaluation of my personality profile.",
  "I do not agree with the AI-agent ratings provided.",
  "It is hard to take the AI-agent ratings seriously.",
  "I do not believe that the AI-agent ratings are accurate.",
];

const SCALE_LABELS: Record<number, string> = {
  1: "Strongly disagree",
  4: "Neutral",
  7: "Strongly agree",
};

interface Props {
  token: string;
}

export default function AgreementSurvey({ token }: Props) {
  const [visible, setVisible] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already submitted
  useEffect(() => {
    fetch(`/api/agreement?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.submitted) {
          setAlreadyDone(true);
        }
      })
      .catch(() => {});
  }, [token]);

  // Show panel after 10 seconds
  useEffect(() => {
    if (alreadyDone) return;
    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, [alreadyDone]);

  const allAnswered = answers.every((a) => a !== null);

  const handleSubmit = useCallback(async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          q1: answers[0],
          q2: answers[1],
          q3: answers[2],
          q4: answers[3],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      setSubmitted(true);
      setTimeout(() => setVisible(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [allAnswered, submitting, token, answers]);

  if (alreadyDone || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out">
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Quick feedback on your AI-agent ratings
            </h3>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {submitted ? (
            <div className="px-5 py-8 text-center">
              <p className="text-green-600 font-medium">
                Thank you for your feedback!
              </p>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-5">
              <p className="text-sm text-gray-600">
                Welcome to your dashboard, we hope you enjoy seeing your
                results. Could you answer a few short questions to help us
                understand your views on AI-personality ratings?
              </p>
              <p className="text-xs text-gray-500">
                Please rate each statement from 1 (strongly disagree) to 7
                (strongly agree).
              </p>

              {QUESTIONS.map((question, qi) => (
                <div key={qi}>
                  <p className="text-sm text-gray-700 mb-2">
                    {qi + 1}. {question}
                  </p>
                  <div className="flex items-center gap-1 justify-between">
                    {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                      <div key={val} className="flex flex-col items-center">
                        <button
                          onClick={() => {
                            const next = [...answers];
                            next[qi] = val;
                            setAnswers(next);
                          }}
                          className={`w-8 h-8 rounded-full border-2 text-xs font-medium transition-colors ${
                            answers[qi] === val
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white text-gray-600 hover:border-blue-400"
                          }`}
                        >
                          {val}
                        </button>
                        {SCALE_LABELS[val] && (
                          <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                            {SCALE_LABELS[val]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex justify-end pt-1 pb-1">
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                    allAnswered && !submitting
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
