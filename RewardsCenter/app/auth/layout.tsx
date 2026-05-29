import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Saraya Rewards",
  description: "Sign in to your Saraya account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth pages have their own layout without the main navigation
  return <>{children}</>;
}
