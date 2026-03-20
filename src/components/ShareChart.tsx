"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";

const SHARE_TEXT =
  "How I see myself, versus how my AI-agent sees me, versus how someone else sees me. Check out my full profile and create your own here:";

interface ShareTarget {
  name: string;
  buildUrl: (dashboardUrl: string, text: string) => string;
  color: string;
  hoverColor: string;
}

const TARGETS: ShareTarget[] = [
  {
    name: "WhatsApp",
    buildUrl: (url, text) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
    color: "bg-green-600",
    hoverColor: "hover:bg-green-700",
  },
  {
    name: "Signal",
    buildUrl: (url, text) =>
      `https://signal.me/#p/?text=${encodeURIComponent(`${text} ${url}`)}`,
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
  },
  {
    name: "Facebook",
    buildUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "bg-blue-700",
    hoverColor: "hover:bg-blue-800",
  },
  {
    name: "LinkedIn",
    buildUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: "bg-blue-800",
    hoverColor: "hover:bg-blue-900",
  },
];

interface Props {
  children: React.ReactNode;
}

export default function ShareChart({ children }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function getShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("shared", "1");
    return url.toString();
  }

  const downloadImage = useCallback(async () => {
    if (!chartRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = "hexaco-personality-chart.png";
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback: just ignore
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  function handleShare(target: ShareTarget) {
    const url = getShareUrl();
    window.open(
      target.buildUrl(url, SHARE_TEXT),
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleCopyLink() {
    const url = getShareUrl();
    navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div ref={chartRef} className="rounded-lg border bg-white p-4">
        {children}
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-500 mb-2">
          Share your personality chart
        </p>
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((target) => (
            <button
              key={target.name}
              onClick={() => handleShare(target)}
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white ${target.color} ${target.hoverColor} transition-colors`}
            >
              {target.name}
            </button>
          ))}
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {downloading ? "Saving..." : "Save image"}
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
