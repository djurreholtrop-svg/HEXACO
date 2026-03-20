"use client";

import { useEffect, useState } from "react";

export default function ParticipationCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out">
      <div className="mx-auto max-w-md px-4 pb-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Want your own personality dashboard?
            </h3>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-gray-600">
              Curious how well your AI agent knows you? Participate in the
              research and get a personal personality dashboard comparing your
              self-report, an AI agent&apos;s assessment, and a rating from
              someone who knows you well.
            </p>
            <div className="flex gap-2">
              <a
                href="/research"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Take the research
              </a>
              <button
                onClick={() => setDismissed(true)}
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                No thanks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
