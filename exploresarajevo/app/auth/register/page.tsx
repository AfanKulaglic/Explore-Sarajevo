"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Loader2, Check, X } from "lucide-react";
import { createAuthSupabaseClient } from "@/app/lib/supabase-auth";
import { centralRegister } from "@/app/lib/central-auth";
import { useTranslation } from "@/app/lib/language-context";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { t } = useTranslation();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState(false);
  const supabase = useMemo(() => createAuthSupabaseClient(), []);

  const checks = { length: password.length >= 15, uppercase: /[A-Z]/.test(password), lowercase: /[a-z]/.test(password), number: /[0-9]/.test(password) };
  const isValid = Object.values(checks).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    if (!isValid) { setError("Password does not meet requirements"); setLoading(false); return; }
    try {
      const result = await centralRegister(email, password, name);
      if (!result.success) { setError(result.error || "Registration failed"); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`), 2000);
    } catch { setError("An error occurred"); setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Check className="w-10 h-10 text-[#a78bfa]" />
          </div>
          <h2 className="text-3xl text-white font-bold mb-2">{t('auth.registrationSuccess')}</h2>
          <p className="text-[#a0a0b8]">{t('auth.redirectingToLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg-base)' }}>
      <div className="relative hidden lg:block">
        <Image src="/assets/carsija.jpg" alt="Sarajevo" fill priority sizes="50vw" className="object-cover opacity-60" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(9,9,15,0.9) 0%, rgba(124,58,237,0.2) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <Link href="/"><Image src="/assets/exploreSarajevo-logo1.png" alt="Explore Sarajevo" width={170} height={50} className="h-10 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} /></Link>
          <div>
            <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.3em] font-bold">◆ Become a member</span>
            <h2 className="mt-3 text-4xl xl:text-5xl font-bold leading-[1.05]">Join the <span className="gradient-text">guide</span>.</h2>
            <p className="mt-3 text-[#a0a0b8] text-sm max-w-sm">One account, every Saraya app — Connect, Rewards, Quiz, Play & Win, and Explore Sarajevo.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 lg:py-0">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-[#a0a0b8] hover:text-[#a78bfa] mb-8 transition text-sm">
            <ArrowLeft className="w-4 h-4" />{t('auth.backToHome')}
          </Link>
          <div className="lg:hidden mb-8">
            <Image src="/assets/exploreSarajevo-logo1.png" alt="Explore Sarajevo" width={170} height={50} className="h-10 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ Create account</span>
          <h1 className="mt-3 text-4xl text-white font-bold leading-tight">{t('auth.createAccount')}</h1>
          <p className="mt-2 text-[#a0a0b8] text-sm">{t('auth.joinCommunity')}</p>

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <Field label={t('auth.name')}>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.yourName')} required
                className="w-full px-4 py-3 rounded-xl text-white placeholder:text-[#5a5a72] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
            </Field>
            <Field label={t('auth.emailAddress')}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                className="w-full px-4 py-3 rounded-xl text-white placeholder:text-[#5a5a72] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
            </Field>
            <Field label={t('auth.password')}>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••••" required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder:text-[#5a5a72] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a72] hover:text-white transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-3 p-3 rounded-xl space-y-1.5" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                  {[
                    [checks.length, t('auth.passwordRequirements.length')],
                    [checks.uppercase, t('auth.passwordRequirements.uppercase')],
                    [checks.lowercase, t('auth.passwordRequirements.lowercase')],
                    [checks.number, t('auth.passwordRequirements.number')],
                  ].map(([met, label]) => (
                    <div key={String(label)} className="flex items-center gap-2 text-xs">
                      {met ? <Check className="w-3.5 h-3.5 text-[#a78bfa]" /> : <X className="w-3.5 h-3.5 text-[#5a5a72]" />}
                      <span className={met ? "text-[#a78bfa] font-medium" : "text-[#5a5a72]"}>{String(label)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Field>
            {error && (
              <div className="px-4 py-3 rounded-xl text-red-400 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>
            )}
            <button type="submit" disabled={loading || !isValid}
              className="w-full py-3 rounded-xl text-white font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'var(--violet)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>{t('auth.creatingAccount')}</span></> : t('auth.createAccount')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#a0a0b8]">
            {t('auth.hasAccount')}{' '}
            <Link href="/auth/login" className="text-[#a78bfa] hover:text-[#c4b5fd] font-semibold transition">{t('auth.signIn')}</Link>
          </p>
          <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a72] font-bold">
              Made by{' '}
              <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer" className="text-[#a0a0b8] hover:text-[#a78bfa] transition">Saraya Solutions</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-widest mb-2">{label}</span>
      {children}
    </label>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}><Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
