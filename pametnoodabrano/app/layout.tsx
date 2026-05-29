import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./lib/auth-context";
import { LanguageProvider } from "./lib/language-context";
import { RewardProvider } from "./lib/reward-context";
import { RewardNotifications } from "./components/RewardNotifications";
import { SsoBootstrapper } from "./components/SsoBootstrapper";
import { CompanyChat } from "@/components/CompanyChat/CompanyChat";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Saraya | Pametno Odabrano",
    template: "%s | Saraya",
  },
  description: "Ekskluzivna kolekcija pažljivo odabranih proizvoda koji spajaju performanse, stil i vrijednost. Tech recenzije, preporuke i vodiči za kupovinu.",
  keywords: ["tech", "gadgets", "elektronika", "pametni uređaji", "recenzije", "preporuke", "Sarajevo", "Bosna i Hercegovina"],
  authors: [{ name: "Saraya" }],
  creator: "Saraya",
  publisher: "Saraya",
  metadataBase: new URL("https://pametnoodabrano.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "bs_BA",
    url: "https://pametnoodabrano.com",
    siteName: "Saraya - Pametno Odabrano",
    title: "Saraya | Pametno Odabrano",
    description: "Ekskluzivna kolekcija pažljivo odabranih proizvoda koji spajaju performanse, stil i vrijednost. Tech recenzije, preporuke i vodiči za kupovinu.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Saraya - Pametno Odabrano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saraya | Pametno Odabrano",
    description: "Ekskluzivna kolekcija pažljivo odabranih proizvoda koji spajaju performanse, stil i vrijednost.",
    images: ["/og-image.jpg"],
    creator: "@saraya",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        <LanguageProvider>
          <AuthProvider>
            <RewardProvider>
              <Suspense fallback={null}>
                <SsoBootstrapper>
                  <Navbar />
                  <main className="min-h-screen">{children}</main>
                  <Footer />
                  <RewardNotifications />
                  <CompanyChat />
                </SsoBootstrapper>
              </Suspense>
            </RewardProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
