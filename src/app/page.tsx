export default function HomePage() {
  return (
    <div className="py-12 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          How well does my AI-agent know me?
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Your personality dashboard
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          This research project compares personality profiles from three
          different sources using the HEXACO-60 questionnaire: your own
          self-report, an AI agent&apos;s assessment, and a rating from someone
          who knows you well.
        </p>
      </section>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-center">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
              1
            </div>
            <h3 className="font-medium mb-1">Self-report</h3>
            <p className="text-sm text-gray-500">
              You complete the HEXACO-60 questionnaire about yourself.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 font-bold">
              2
            </div>
            <h3 className="font-medium mb-1">AI Agent</h3>
            <p className="text-sm text-gray-500">
              You direct your ChatGPT AI agent to complete the HEXACO-60 about
              you.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold">
              3
            </div>
            <h3 className="font-medium mb-1">Close Other</h3>
            <p className="text-sm text-gray-500">
              You invite someone who knows you well to rate you on the HEXACO-60.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          About HEXACO Personality
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-600 mb-4">
            In this research project, we measure your personality with the
            HEXACO-60 personality inventory. The HEXACO model of personality
            captures six broad dimensions:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                letter: "H",
                name: "Honesty-Humility",
                desc: "Sincerity, fairness, greed avoidance, modesty",
              },
              {
                letter: "E",
                name: "Emotionality",
                desc: "Fearfulness, anxiety, dependence, sentimentality",
              },
              {
                letter: "X",
                name: "Extraversion",
                desc: "Social self-esteem, social boldness, sociability, liveliness",
              },
              {
                letter: "A",
                name: "Agreeableness",
                desc: "Forgiveness, gentleness, flexibility, patience",
              },
              {
                letter: "C",
                name: "Conscientiousness",
                desc: "Organization, diligence, perfectionism, prudence",
              },
              {
                letter: "O",
                name: "Openness to Experience",
                desc: "Aesthetic appreciation, inquisitiveness, creativity, unconventionality",
              },
            ].map((d) => (
              <div key={d.letter} className="flex gap-3 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-bold">
                  {d.letter}
                </span>
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            The HEXACO personality inventory has been developed by Kibeom Lee,
            Ph.D., and Michael C. Ashton, Ph.D. For more information, head
            to{" "}
            <a
              href="https://hexaco.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              HEXACO.org
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Learn more
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <a
            href="https://hexaco.org"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border bg-white p-6 hover:border-gray-400 transition-colors group"
          >
            <h3 className="font-medium mb-2 group-hover:text-blue-600">
              HEXACO.org
            </h3>
            <p className="text-sm text-gray-500">
              Visit hexaco.org for background information, published materials,
              and resources on the HEXACO model of personality.
            </p>
          </a>
          <a
            href="/participate"
            className="rounded-lg border bg-white p-6 hover:border-gray-400 transition-colors group"
          >
            <h3 className="font-medium mb-2 group-hover:text-blue-600">
              Participate
            </h3>
            <p className="text-sm text-gray-500">
              Interested in contributing to our research? Learn what
              participation involves and how to sign up.
            </p>
          </a>
          <a
            href="/research"
            className="rounded-lg border bg-white p-6 hover:border-gray-400 transition-colors group"
          >
            <h3 className="font-medium mb-2 group-hover:text-blue-600">
              Research Team &amp; Ethics
            </h3>
            <p className="text-sm text-gray-500">
              Meet the research team behind this project and read about our
              ethical guidelines and approvals.
            </p>
          </a>
        </div>
      </section>

      <section className="text-center text-sm text-gray-400">
        <p>
          Participants: use the unique link provided to you to access your
          dashboard.
        </p>
      </section>
    </div>
  );
}
