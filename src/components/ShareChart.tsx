"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";

const SHARE_TEXT =
  "How I see myself, versus how my AI-agent sees me, versus how someone else sees me. Check out my full profile and create your own here:";

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

  const downloadChart = useCallback(async () => {
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
      // silently fail
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  async function handleShare() {
    const url = getShareUrl();
    const shareData = {
      title: "My HEXACO Personality Profile",
      text: SHARE_TEXT,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div ref={chartRef} className="rounded-lg border bg-white p-4">
        {children}
      </div>
      <div className="mt-4 rounded-lg border bg-gray-50 p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleShare}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {copied ? "Link copied!" : "Share"}
          </button>
          <button
            onClick={downloadChart}
            disabled={downloading}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {downloading ? "Saving..." : "Download chart"}
          </button>
          <span className="text-xs text-gray-400">
            Download your chart to share on Instagram or other platforms
          </span>
        </div>
      </div>
    </div>
  );
}
