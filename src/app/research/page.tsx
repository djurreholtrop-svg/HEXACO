export default function ResearchPage() {
  return (
    <div className="py-12 space-y-10 max-w-3xl mx-auto">
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Research Team &amp; Ethics
        </h1>
        <p className="text-lg text-gray-500">
          Learn about the people behind this project and our commitment to
          ethical research practices.
        </p>
      </section>

      <section className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="text-xl font-semibold">Research Team</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-500">
              DH
            </div>
            <div>
              <p className="font-medium">Djurre Holtrop</p>
              <p className="text-sm text-gray-500">
                Assistant Professor, Department of Social Psychology, Tilburg
                University
              </p>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                <a
                  href="https://www.tilburguniversity.edu/staff/d-j-holtrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  University profile
                </a>
                <a
                  href="https://www.linkedin.com/in/djurre-holtrop-b4870a11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  LinkedIn
                </a>
                <a
                  href="mailto:d.j.holtrop@tilburguniversity.edu"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  d.j.holtrop@tilburguniversity.edu
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 pt-2">
          Have any questions about this research? Feel free to reach out — I am
          always happy to hear from you!
        </p>
      </section>

      <section className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="text-xl font-semibold">Ethics</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            This research has been approved by the Ethical Review Board of
            Tilburg University&apos;s School of Behavioral and Social Sciences
            (TSB_RP2449_27).
          </p>
          <p>
            Participation in this study is entirely voluntary. All data is
            collected and processed in compliance with the General Data
            Protection Regulation (GDPR). Participants may withdraw from the
            study at any time without consequence.
          </p>
        </div>
      </section>

      <div className="text-center">
        <a
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          &larr; Back to home
        </a>
      </div>
    </div>
  );
}
