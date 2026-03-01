export default function ParticipatePage() {
  return (
    <div className="py-12 space-y-10 max-w-3xl mx-auto">
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          See how well your AI-agent knows you &ndash; Participate in the research
        </h1>
        <p className="text-lg text-gray-500">
          We are looking for participants to contribute to our study on
          personality assessment. Below you can find information on what
          participation involves.
        </p>
      </section>

      <section className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="text-xl font-semibold">What does participation involve?</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            As a participant you will complete three steps, each involving the
            HEXACO-60 personality questionnaire:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              <span className="font-medium text-gray-900">Self-report</span> —
              You fill in the HEXACO-60 about yourself.
            </li>
            <li>
              <span className="font-medium text-gray-900">AI Agent</span> —
              You instruct your ChatGPT AI agent to fill in the HEXACO-60 about
              you.
            </li>
            <li>
              <span className="font-medium text-gray-900">Close Other</span> —
              You invite someone who knows you well to complete the HEXACO-60
              about you.
            </li>
          </ol>
          <p>
            After completing all three steps you will receive access to a
            personal dashboard where you can compare the three personality
            profiles side by side.
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="text-xl font-semibold">How to sign up</h2>
        <p className="text-sm text-gray-600">
          Ready to participate? Click the button below to start the
          questionnaire. It will take approximately 25 minutes to complete.
        </p>
        <div className="space-y-4 pt-2">
          <div className="rounded-md bg-blue-50 p-4 text-sm text-gray-700">
            <p className="font-medium mb-2">Before you start, to participate in this research you need to:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>
                Have access to an AI-agent to complete a questionnaire for you.
                In most cases this requires a paid ChatGPT, Claude account, or
                other generative AI account.
              </li>
              <li>
                Be willing to enable your AI-agent to access your chat history.
              </li>
            </ol>
          </div>
          <a
            href="https://tilburgss.co1.qualtrics.com/jfe/form/SV_9Kp2B62IUcnP7Wm?Source=Website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Start the questionnaire
          </a>
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
