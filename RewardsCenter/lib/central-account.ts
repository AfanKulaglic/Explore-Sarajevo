/**
 * Central Account Management System Integration
 * 
 * This module handles all interactions with the centralized account system
 * that manages user accounts, coins, tokens, and XP across all platforms.
 */

import {
  type AccountSystemRow,
  getAccountBalance,
} from '@/lib/account-api'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'
const PLATFORM_CODE = 'GIFT_SHOP'
const PLATFORM_KEY = process.env.CENTRAL_PLATFORM_KEY || ''

export type CentralAccount = AccountSystemRow & {
  email: string
  name: string
}

export interface UserBalance {
  coins: number
  tokens: number
  xp: number
  level: number
}

/**
 * Check if an account exists in the central system
 */
export async function checkAccountExists(email: string): Promise<CentralAccount | null> {
  try {
    const response = await fetch(
      `${CENTRAL_API_URL}/api/accounts?search=${encodeURIComponent(email)}`,
      {
        headers: {
          'x-admin-email': ADMIN_EMAIL
        }
      }
    )

    if (!response.ok) {
      console.error('Failed to check account:', await response.text())
      return null
    }

    const result = await response.json()
    
    if (result.data && result.data.length > 0) {
      return result.data[0] as CentralAccount
    }
    
    return null
  } catch (error) {
    console.error('Error checking account:', error)
    return null
  }
}

/**
 * Get account by ID
 */
export async function getAccountById(accountId: string): Promise<CentralAccount | null> {
  try {
    const url = `${CENTRAL_API_URL}/api/accounts?search=${accountId}`
    console.log('Getting account by ID:', accountId)
    console.log('URL:', url)
    console.log('Admin email:', ADMIN_EMAIL)
    
    const response = await fetch(url, {
      headers: {
        'x-admin-email': ADMIN_EMAIL
      }
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return null
    }

    const result = await response.json()
    console.log('Result:', JSON.stringify(result, null, 2))
    
    if (result.data && result.data.length > 0) {
      return result.data[0] as CentralAccount
    }
    
    return null
  } catch (error) {
    console.error('Error getting account by ID:', error)
    return null
  }
}

/**
 * Get all accounts (for admin)
 */
export async function getAllAccounts(): Promise<CentralAccount[]> {
  try {
    const response = await fetch(
      `${CENTRAL_API_URL}/api/accounts`,
      {
        headers: {
          'x-admin-email': ADMIN_EMAIL
        }
      }
    )

    if (!response.ok) {
      console.error('Failed to get accounts:', await response.text())
      return []
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error getting accounts:', error)
    return []
  }
}

/**
 * Get user balance (coins, tokens, XP, level)
 */
export async function getUserBalance(email: string): Promise<UserBalance | null> {
  try {
    const account = await checkAccountExists(email)
    
    if (!account) {
      return null
    }
    
    return getAccountBalance(account as Record<string, unknown>)
  } catch (error) {
    console.error('Error getting user balance:', error)
    return null
  }
}

/**
 * Get user balance by accountId
 */
export async function getUserBalanceById(accountId: string): Promise<UserBalance | null> {
  try {
    const account = await getAccountById(accountId)
    
    if (!account) {
      return null
    }
    
    return getAccountBalance(account as Record<string, unknown>)
  } catch (error) {
    console.error('Error getting user balance by ID:', error)
    return null
  }
}

/**
 * Get user balance by email
 */
export async function getUserBalanceByEmail(email: string): Promise<UserBalance | null> {
  try {
    const account = await checkAccountExists(email)
    
    if (!account) {
      console.log('No account found for email:', email)
      return null
    }
    
    return getAccountBalance(account as Record<string, unknown>)
  } catch (error) {
    console.error('Error getting user balance by email:', error)
    return null
  }
}

/**
 * Record a platform activity (deduct/add coins, tokens, XP)
 */
export async function recordPlatformActivity(
  accountId: string,
  eventType: string,
  coinsChange: number = 0,
  tokensChange: number = 0,
  xpChange: number = 0,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/platforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-platform-code': PLATFORM_CODE,
        'x-platform-key': PLATFORM_KEY
      },
      body: JSON.stringify({
        accountId,
        eventType,
        coinsChange,
        tokensChange,
        xpChange,
        metadata: {
          ...metadata,
          platform: 'rewards-store',
          timestamp: new Date().toISOString()
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to record activity:', errorText)
      return { success: false, error: 'Failed to record activity' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error recording platform activity:', error)
    return { success: false, error: 'Network error while recording activity' }
  }
}

/**
 * Deduct coins for a reward redemption using admin API
 */
export async function deductCoinsForRedemption(
  accountId: string,
  rewardId: string,
  rewardTitle: string,
  amount: number,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use admin API to deduct balance
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': ADMIN_EMAIL
      },
      body: JSON.stringify({
        balanceDelta: -amount // Negative to deduct
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to deduct coins:', errorText)
      return { success: false, error: 'Failed to deduct coins' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deducting coins:', error)
    return { success: false, error: 'Network error while deducting coins' }
  }
}

/**
 * Deduct tokens for a reward redemption using admin API
 */
export async function deductTokensForRedemption(
  accountId: string,
  rewardId: string,
  rewardTitle: string,
  amount: number,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use admin API to deduct tokens
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': ADMIN_EMAIL
      },
      body: JSON.stringify({
        tokensDelta: -amount // Negative to deduct
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to deduct tokens:', errorText)
      return { success: false, error: 'Failed to deduct tokens' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deducting tokens:', error)
    return { success: false, error: 'Network error while deducting tokens' }
  }
}

/**
 * Refund coins for a cancelled/denied order
 */
export async function refundCoinsForOrder(
  accountId: string,
  rewardId: string,
  rewardTitle: string,
  amount: number,
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  return recordPlatformActivity(
    accountId,
    'order_refund',
    amount, // Positive to add back
    0,
    0,
    {
      rewardId,
      rewardTitle,
      orderId,
      reason,
      type: 'refund'
    }
  )
}

/**
 * Award tournament prizes
 */
export async function awardTournamentPrize(
  accountId: string,
  tournamentId: string,
  tournamentTitle: string,
  place: number,
  coins: number,
  tokens: number,
  xp: number
): Promise<{ success: boolean; error?: string }> {
  return recordPlatformActivity(
    accountId,
    'tournament_prize',
    coins,
    tokens,
    xp,
    {
      tournamentId,
      tournamentTitle,
      place,
      type: 'tournament_prize'
    }
  )
}

/**
 * Deduct tournament entry fee using admin API
 */
export async function deductTournamentEntryFee(
  accountId: string,
  tournamentId: string,
  tournamentTitle: string,
  amount: number,
  currency: 'COINS' | 'TOKENS'
): Promise<{ success: boolean; error?: string }> {
  try {
    const body: any = {}
    if (currency === 'COINS') {
      body.balanceDelta = -amount
    } else {
      body.tokensDelta = -amount
    }

    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': ADMIN_EMAIL
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to deduct tournament entry fee:', errorText)
      return { success: false, error: 'Failed to deduct entry fee' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deducting tournament entry fee:', error)
    return { success: false, error: 'Network error while deducting entry fee' }
  }
}

/**
 * Award achievement rewards
 */
export async function awardAchievementRewards(
  accountId: string,
  achievementCode: string,
  achievementTitle: string,
  coins: number,
  tokens: number,
  xp: number
): Promise<{ success: boolean; error?: string }> {
  return recordPlatformActivity(
    accountId,
    'achievement_unlocked',
    coins,
    tokens,
    xp,
    {
      achievementCode,
      achievementTitle,
      type: 'achievement'
    }
  )
}

/**
 * Update account avatar using admin API
 */
export async function updateAccountAvatar(
  email: string,
  avatarUrl: string,
  avatarConfig?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the account ID
    const account = await checkAccountExists(email)
    
    if (!account) {
      return { success: false, error: 'Account not found' }
    }

    // Use admin API to update the avatar
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${account.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': ADMIN_EMAIL
      },
      body: JSON.stringify({
        avatarUrl,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to update avatar:', errorText)
      return { success: false, error: 'Failed to update avatar in central system' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating avatar:', error)
    return { success: false, error: 'Network error while updating avatar' }
  }
}
