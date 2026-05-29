'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, Loader2, Users } from 'lucide-react';

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [status, setStatus] = useState<'loading' | 'redirecting'>('loading');

  useEffect(() => {
    if (code) {
      // Show the landing page briefly, then redirect to login
      setTimeout(() => {
        setStatus('redirecting');
        setTimeout(() => {
          router.push('/auth/login');
        }, 500);
      }, 2000);
    }
  }, [code, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full blur-xl opacity-50" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-600">
                <Gift size={36} className="text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            You've Been Invited!
          </h1>
          <p className="text-white/60 mb-6">
            Someone wants you to join Saraya Rewards
          </p>

          {/* Referral Code Display */}
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 mb-6">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Referral Code</p>
            <p className="text-2xl font-mono font-bold text-brand-400">{code?.toUpperCase()}</p>
            <p className="text-xs text-white/40 mt-2">Enter this code after signing up to get your bonus!</p>
          </div>

          {/* Reward Info */}
          <div className="flex items-center justify-center gap-3 rounded-xl bg-white/5 p-4 mb-6">
            <Users size={20} className="text-emerald-400" />
            <p className="text-sm text-white/80">
              Get <span className="font-bold text-emerald-400">3,000 coins</span> when you sign up!
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-white/60">
            <Loader2 size={16} className="animate-spin text-brand-400" />
            <span className="text-sm text-brand-400">
              {status === 'loading' ? 'Welcome!' : 'Taking you to sign up...'}
            </span>
          </div>
        </div>

        {/* Manual link */}
        <p className="text-center mt-4 text-xs text-white/40">
          Not redirecting?{' '}
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-brand-400 hover:underline"
          >
            Click here
          </button>
        </p>
      </motion.div>
    </div>
  );
}
