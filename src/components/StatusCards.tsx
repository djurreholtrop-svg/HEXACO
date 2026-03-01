const SOURCES = [
  {
    key: "self",
    label: "Self-report",
    description: "Your own HEXACO-60 responses",
    color: "border-gray-700 bg-gray-100",
    dot: "bg-black",
  },
  {
    key: "ai",
    label: "AI Agent",
    description: "Your AI agent's responses about you",
    color: "border-violet-400 bg-violet-50",
    dot: "bg-violet-500",
  },
  {
    key: "other",
    label: "Close Other",
    description: "A close other's responses about you",
    color: "border-amber-400 bg-amber-50",
    dot: "bg-amber-500",
  },
] as const;

interface Props {
  completedSources: string[];
  visibleSources: string[];
}

export default function StatusCards({ completedSources, visibleSources }: Props) {
  const filtered = SOURCES.filter((s) => visibleSources.includes(s.key));

  return (
    <div className={`grid gap-4 sm:grid-cols-${filtered.length}`}>
      {filtered.map((s) => {
        const done = completedSources.includes(s.key);
        return (
          <div
            key={s.key}
            className={`rounded-lg border-2 p-4 ${
              done ? s.color : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  done ? s.dot : "bg-gray-300"
                }`}
              />
              <span className="font-medium text-sm">{s.label}</span>
            </div>
            <p className="text-xs text-gray-500">{s.description}</p>
            <p className="mt-2 text-xs font-medium">
              {done ? "Completed" : "Awaiting data"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
