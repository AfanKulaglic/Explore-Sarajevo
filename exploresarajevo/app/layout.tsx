import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./lib/auth-context";
import { LanguageProvider } from "./lib/language-context";
import { RewardAuthProvider } from "./lib/reward-auth-provider";
import { SsoBootstrapper } from "./components/SsoBootstrapper";
import { CompanyChat } from "@/components/CompanyChat/CompanyChat";
import LanguagePickerModal from "./components/LanguagePickerModal";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Explore Sarajevo — A Field Guide to the Heart of Bosnia",
    template: "%s · Explore Sarajevo",
  },
  description:
    "Otkrijte najbolje restorane, kafiće, atrakcije i događaje u Sarajevu. Vaš ultimativni vodič za istraživanje srca Bosne i Hercegovine.",
  keywords: [
    "Sarajevo",
    "turizam",
    "restorani",
    "kafići",
    "atrakcije",
    "događaji",
    "Bosna i Hercegovina",
    "putovanje",
    "vodič",
  ],
  authors: [{ name: "Saraya" }],
  creator: "Saraya",
  publisher: "Saraya",
  metadataBase: new URL("https://bihdiscovery.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "bs_BA",
    url: "https://bihdiscovery.com",
    siteName: "Explore Sarajevo",
    title: "Explore Sarajevo — A Field Guide to the Heart of Bosnia",
    description:
      "Otkrijte najbolje restorane, kafiće, atrakcije i događaje u Sarajevu.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Explore Sarajevo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Sarajevo",
    description:
      "Otkrijte najbolje restorane, kafiće, atrakcije i događaje u Sarajevu.",
    images: ["/og-image.jpg"],
    creator: "@sarajevo",
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
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bs"
      className={`${inter.variable} scroll-smooth`}
      style={{ colorScheme: "dark", overflowX: "hidden" }}
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }} suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <RewardAuthProvider>
              <Suspense fallback={null}>
                <SsoBootstrapper>
                  <Navbar />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                  <CompanyChat />
                  <LanguagePickerModal />
                </SsoBootstrapper>
              </Suspense>
            </RewardAuthProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
