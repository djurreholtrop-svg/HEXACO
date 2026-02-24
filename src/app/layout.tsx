import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEXACO Personality Dashboard",
  description:
    "View and compare HEXACO-60 personality scores from self-report, AI agent, and close other ratings.",
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
              HEXACO Dashboard
            </a>
            <nav className="flex gap-4 text-sm text-gray-500">
              <a href="/participate" className="hover:text-gray-900">
                Participate
              </a>
              <a href="/research" className="hover:text-gray-900">
                Research &amp; Ethics
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
