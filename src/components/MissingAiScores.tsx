"use client";

import { useEffect, useState } from "react";

interface Props {
  token: string;
}

export default function MissingAiScores({ token }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Show panel after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const agentPrompt = `Hi there, you know me pretty well. Can you please help me with a task? I need to complete a personality inventory. I would like you to do that for me on my behalf. Please complete the survey as if you were me, based on what you know about me from our conversations. Make sure to click the 'next' button after completing all 60 items in order to finish the survey without asking me to confirm this to you again. Here is the link: https://tilburgss.co1.qualtrics.com/jfe/form/SV_6xL9M0N0fLz1YeW?token=${token} Thanks!`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(agentPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out">
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-800">
              AI-agent results missing
            </h3>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-gray-700">
              Welcome to your dashboard. It appears that your AI-agent results
              are still missing. You can resolve this by either:
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700">
                  <strong>A)</strong> Checking the ChatGPT chat in which you
                  instructed the agent. It might be waiting for you to instruct
                  it to click &lsquo;Finish the survey&rsquo; or to &lsquo;Click
                  next&rsquo;.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-700">
                  <strong>B)</strong> You can also start a new agent session to
                  rate your personality. You do this by opening a new chat and
                  clicking &lsquo;+&rsquo;, followed by &lsquo;&hellip;
                  more &gt;&rsquo;, and selecting &lsquo;Agent mode&rsquo;. Then
                  give the agent the following prompt:
                </p>
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-600 italic whitespace-pre-wrap">
                    {agentPrompt}
                  </p>
                </div>
                <div className="mt-2">
                  <button
                    onClick={handleCopy}
                    className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                      copied
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy prompt"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
