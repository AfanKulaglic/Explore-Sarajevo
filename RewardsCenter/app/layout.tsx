import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { FriendsProvider } from "@/lib/friends-context";
import { I18nProvider } from "@/lib/i18n";
import { MainLayout } from "@/components/layout/MainLayout";
import { SsoBootstrapper } from "@/components/SsoBootstrapper";
import { NotificationPopup } from "@/components/notifications/NotificationPopup";
import { cn } from "@/lib/utils";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Saraya Rewards Store",
  description: "Redeem points earned across Saraya games for premium rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "antialiased text-slate-100",
          plusJakarta.variable,
          "bg-[radial-gradient(circle_at_20%_20%,rgba(65,105,255,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.2),transparent_35%),linear-gradient(135deg,#040a1f,#060b1c)]"
        )}
      >
        <Suspense fallback={null}>
          <SsoBootstrapper>
            <I18nProvider>
              <AuthProvider>
                <FriendsProvider>
                  <NotificationsProvider>
                    <MainLayout>{children}</MainLayout>
                    <NotificationPopup />
                  </NotificationsProvider>
                </FriendsProvider>
              </AuthProvider>
            </I18nProvider>
          </SsoBootstrapper>
        </Suspense>
      </body>
    </html>
  );
}
