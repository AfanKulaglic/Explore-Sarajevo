"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if email is in admin list
      if (!adminEmails.includes(email.toLowerCase())) {
        setError("Access denied. You are not authorized to access this admin panel.");
        setLoading(false);
        return;
      }

      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Verify again that the logged-in user is an admin
        if (!adminEmails.includes(data.user.email?.toLowerCase() ?? "")) {
          await supabase.auth.signOut();
          setError("Access denied. You are not authorized to access this admin panel.");
          setLoading(false);
          return;
        }

        // Success - redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-card backdrop-blur">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand.primary/60 to-brand.accent/60">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-white">Admin Access</h1>
          <p className="mt-2 text-center text-sm text-white/60">
            Sign in to access the Saraya Accounts console
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
              className={cn(
                "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white",
                "placeholder:text-white/40",
                "focus:border-brand.primary focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/50">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className={cn(
                "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white",
                "placeholder:text-white/40",
                "focus:border-brand.primary focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-wider",
              "bg-gradient-to-r from-brand.primary to-brand.accent text-white",
              "transition-all hover:shadow-lg hover:shadow-brand.primary/40",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Only authorized administrators can access this system.
        </p>
      </div>
    </motion.div>
  );
}
