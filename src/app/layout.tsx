import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "How well does my AI-agent know me?",
  description:
    "My personality dashboard — compare HEXACO-60 personality scores from self-report, AI agent, and close other ratings.",
  openGraph: {
    title: "How well does my AI-agent know me?",
    description:
      "How I see myself, versus how my AI-agent sees me, versus how someone else sees me. Check out my full profile and create your own!",
    siteName: "HEXACO Personality Dashboard",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "How well does my AI-agent know me?",
    description:
      "How I see myself, versus how my AI-agent sees me, versus how someone else sees me. Check out my full profile and create your own!",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              How well does my AI-agent know me?
            </a>
            <nav className="flex gap-4 text-sm text-gray-500">
              <a href="/participate" className="hover:text-gray-900">
                Take the research
              </a>
              <a href="/research" className="hover:text-gray-900">
                About the research
              </a>
              <a href="/" className="hover:text-gray-900">
                Home
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
