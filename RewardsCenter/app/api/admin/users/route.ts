import { NextRequest, NextResponse } from 'next/server'
import { getAllAccounts } from '@/lib/central-account'
import {
  asAccountRecord,
  getAccountBalance,
  getAccountDisplayStatus,
} from '@/lib/account-api'

/**
 * Admin Users API - Fetches users from Account-System
 * GET /api/admin/users
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const accounts = await getAllAccounts()

    // Transform to include balance info
    const users = accounts.map((account) => {
      const row = asAccountRecord(account)
      const balance = getAccountBalance(row)
      return {
        id: account.id,
        email: account.email,
        name: account.name,
        status: getAccountDisplayStatus(row),
        avatar_url: account.avatar_url,
        coins: balance.coins,
        tokens: balance.tokens,
        xp: balance.xp,
        level: balance.level,
        created_at: account.created_at || null,
      }
    })

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
