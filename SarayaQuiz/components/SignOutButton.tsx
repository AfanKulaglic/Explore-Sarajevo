'use client'

import { useRouter } from 'next/navigation'
import { createAuthSupabaseClient } from '@/lib/supabase-auth'
import { clearSarayaAccount } from '@/lib/saraya-account'
import { Button } from './ui/Button'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createAuthSupabaseClient()
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    clearSarayaAccount()
    
    // Redirect to homepage (not login)
    router.push('/')
    router.refresh()
  }

  return (
    <Button 
      onClick={handleSignOut}
      variant="danger"
    >
      Sign Out
    </Button>
  )
}
