import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Showrunner — Autonomous Studio Operations & Observability Copilot',
  description: 'Production-grade multi-agent studio operations copilot powered by Google Gemini 3.x and Grafana Cloud MCP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-950 text-slate-100 min-h-screen antialiased selection:bg-amber-500 selection:text-studio-950">
        {children}
      </body>
    </html>
  );
}
