import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Saraya Accounts Console",
  description: "Unified admin surface for Saraya platform accounts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${spaceGrotesk.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <div className="min-h-screen bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-slate-950/80">
          {children}
        </div>
      </body>
    </html>
  );
}
