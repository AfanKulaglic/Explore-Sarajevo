import { createSupabaseServerClient } from './supabase'
import { cookies } from 'next/headers'

export async function getSession() {
  const supabase = await createSupabaseServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  
  return session
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  
  if (!session?.user?.email) {
    return false
  }
  
  // Check if user's email is in the admin allowlist
  const adminEmailsStr = process.env.ADMIN_EMAILS || ''
  const adminEmails = adminEmailsStr.split(',').map(email => email.trim().toLowerCase())
  
  const userEmail = session.user.email.toLowerCase()
  return adminEmails.includes(userEmail)
}

export async function requireAdmin() {
  const admin = await isAdmin()
  
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  const session = await getSession()
  return session!
}
