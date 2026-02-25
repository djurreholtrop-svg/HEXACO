"use client";

import { useState } from "react";

const SHARE_TEXT = "Check out my HEXACO personality profile!";

function getShareUrl(): string {
  return typeof window !== "undefined" ? window.location.href : "";
}

interface ShareTarget {
  name: string;
  getUrl: (dashboardUrl: string, text: string) => string;
  color: string;
  hoverColor: string;
}

const TARGETS: ShareTarget[] = [
  {
    name: "WhatsApp",
    getUrl: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    color: "bg-green-600",
    hoverColor: "hover:bg-green-700",
  },
  {
    name: "Signal",
    getUrl: (url, text) =>
      `https://signal.me/#p/?text=${encodeURIComponent(`${text} ${url}`)}`,
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
  },
  {
    name: "Facebook",
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "bg-blue-700",
    hoverColor: "hover:bg-blue-800",
  },
  {
    name: "LinkedIn",
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: "bg-blue-800",
    hoverColor: "hover:bg-blue-900",
  },
];

export default function ShareResults() {
  const [copied, setCopied] = useState(false);

  function handleCopyLink() {
    navigator.clipboard.writeText(getShareUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Share My Results</h2>
      <div className="rounded-lg border bg-white p-4">
        <p className="text-sm text-gray-500 mb-4">
          Share your personality profile with friends and family.
        </p>
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((target) => (
            <a
              key={target.name}
              href={target.getUrl(getShareUrl(), SHARE_TEXT)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white ${target.color} ${target.hoverColor} transition-colors`}
            >
              {target.name}
            </a>
          ))}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </section>
  );
}
