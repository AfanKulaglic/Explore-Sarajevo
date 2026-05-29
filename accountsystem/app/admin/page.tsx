"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const AdminConsole = dynamic(() => import("@/components/dashboard/AdminConsole"), { ssr: false });

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      } else if (session) {
        const email = session.user.email?.toLowerCase();
        if (email && adminEmails.includes(email)) {
          setIsAuthorized(true);
        } else {
          supabase.auth.signOut();
          router.push('/login');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const email = session.user.email?.toLowerCase();
      if (!email || !adminEmails.includes(email)) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          <p className="text-sm text-white/60">Verifying access...</p>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <AdminConsole />
    </main>
  );
}
