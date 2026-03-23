import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { BackToTop } from "@/components/BackToTop";
import { Background } from "@/components/Background";
import { PageTransition } from "@/components/PageTransition";
import { AIAgent } from "@/components/AIAgent";
import { CommandPalette } from "@/components/CommandPalette";
import { AgentProvider } from "@/lib/agent/context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rishabh Durugkar | Infrastructure · Networking · Security",
  description: "Reliability, automation, and observability for AI-ready environments. Infrastructure, networking, and security engineering portfolio.",
  keywords: ["infrastructure", "networking", "security", "automation", "observability", "AI infrastructure"],
  authors: [{ name: "Rishabh Durugkar" }],
  openGraph: {
    title: "Rishabh Durugkar | Infrastructure Engineer",
    description: "Reliability, automation, and observability for AI-ready environments.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishabh Durugkar | Infrastructure Engineer",
    description: "Reliability, automation, and observability for AI-ready environments.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AgentProvider>
          <Background />
          <Navigation />
          <PageTransition>
            <main className="min-h-screen">
              {children}
            </main>
          </PageTransition>
          <BackToTop />
          <AIAgent />
          <CommandPalette />
        </AgentProvider>
      </body>
    </html>
  );
}
