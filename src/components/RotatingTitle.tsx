"use client";

import { useEffect, useState } from "react";

const TITLES = [
  "How well does my AI-agent know me?",
  "How well does my friend know me?",
  "How well do I know myself?",
  "How well does my family know me?",
];

export default function RotatingTitle() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % TITLES.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-4xl font-bold tracking-tight h-[2.5em] flex items-center justify-center">
      <span
        className={`transition-opacity duration-400 ${fade ? "opacity-100" : "opacity-0"}`}
      >
        {TITLES[index]}
      </span>
    </h1>
  );
}
