'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createAuthSupabaseClient } from '@/lib/supabase-auth'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { centralLogin } from '@/lib/central-auth'
import { linkCentralSession } from '@/lib/sso'
import { persistSarayaAccount } from '@/lib/saraya-account'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Use the AUTH Supabase client (connected to central account system)
  const supabase = useMemo(() => createAuthSupabaseClient(), [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use central account system for authentication
      const result = await centralLogin(email, password)

      if (!result.success || !result.session) {
        setError(result.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      // Set the session in local Supabase client using the tokens from central system
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      })

      if (sessionError) {
        setError('Failed to establish session')
        setLoading(false)
        return
      }

      if (result.account) {
        persistSarayaAccount(result.account)
      }

      const fullRedirectUrl = new URL(redirect, window.location.origin).toString()
      linkCentralSession(result.session, fullRedirectUrl)
    } catch (err) {
      setError('An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-blue-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/80">Sign in to continue your quiz journey</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label="Email"
            labelClassName="text-white drop-shadow-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="bg-white/20 backdrop-blur-md border-white/30 text-white placeholder-white/50"
          />
          
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              labelClassName="text-white drop-shadow-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="bg-white/20 backdrop-blur-md border-white/30 text-white placeholder-white/50 pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-white/70 hover:text-white text-sm transition"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {searchParams.get('registered') === 'true' && (
            <div className="bg-green-500/20 backdrop-blur-lg border border-green-400/50 text-white px-4 py-3 rounded-2xl">
              ✅ Account created successfully! Please sign in.
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/50 text-white px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-white/80 text-center mt-6">
          Don't have an account?{' '}
          <Link href={`/auth/user-register?redirect=${redirect}`} className="text-white font-semibold hover:underline">
            Sign Up
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link href="/admin" className="text-white/60 hover:text-white/90 text-sm transition">
            Admin Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-blue-500">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
