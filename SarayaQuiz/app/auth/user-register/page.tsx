'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createAuthSupabaseClient } from '@/lib/supabase-auth'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { centralRegister } from '@/lib/central-auth'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Use the AUTH Supabase client (connected to central account system)
  const supabase = useMemo(() => createAuthSupabaseClient(), [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate password length
    if (password.length < 15) {
      setError('Password must be at least 15 characters long')
      return
    }

    setLoading(true)

    try {
      // Use central account system for registration
      const result = await centralRegister(email, password, name)

      if (!result.success) {
        setError(result.error || 'Failed to create account')
        setLoading(false)
        return
      }

      // Account created successfully - redirect to login page
      window.location.href = `/auth/user-login?redirect=${encodeURIComponent(redirect)}&registered=true`
    } catch (err) {
      console.error('Registration error:', err)
      setError('An error occurred during registration')
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
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/80">Join SarayaQuizzes and start earning rewards!</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="text"
            label="Display Name"
            labelClassName="text-white drop-shadow-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="bg-white/20 backdrop-blur-md border-white/30 text-white placeholder-white/50"
          />

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
          
          <div>
            <Input
              type="password"
              label="Password"
              labelClassName="text-white drop-shadow-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              required
              minLength={15}
              className="bg-white/20 backdrop-blur-md border-white/30 text-white placeholder-white/50"
            />
            <p className="text-xs text-white/70 mt-1.5 ml-1">
              🔒 Minimum 15 characters for enhanced security standards
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/50 text-white px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-sm text-white/80 text-center mt-6">
          Already have an account?{' '}
          <Link href={`/auth/user-login?redirect=${redirect}`} className="text-white font-semibold hover:underline">
            Sign In
          </Link>
        </p>

        <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur-lg rounded-2xl border border-blue-400/30">
          <p className="text-xs text-white/90 text-center">
            🎁 Earn coins, tokens, and XP by completing quizzes!
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function UserRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-blue-500">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
