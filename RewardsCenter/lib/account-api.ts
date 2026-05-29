/**
 * Account System API shapes (schema: accountsystem).
 * Nested relations: coin_wallets, xp_profiles on each account row.
 */

export type CoinWalletPayload = {
  coins_balance?: number
  tokens_balance?: number
  coins_reserved?: number
  tokens_reserved?: number
}

export type XpProfilePayload = {
  level?: number
  xp_total?: number
  xp_current_level?: number
  xp_next_level?: number
}

export type AccountSystemRow = {
  id: string
  email?: string
  name?: string | null
  avatar_url?: string | null
  is_deleted?: boolean
  created_at?: string
  updated_at?: string
  coin_wallets?: CoinWalletPayload | null
  xp_profiles?: XpProfilePayload | null
  /** @deprecated pre-migration nested name — kept for backwards compatibility */
  accounts_coin_wallets?: CoinWalletPayload | null
  /** @deprecated pre-migration nested name */
  accounts_xp_profiles?: XpProfilePayload | null
}

export type AccountBalance = {
  coins: number
  tokens: number
  xp: number
  level: number
}

export function asAccountRecord(
  account: AccountSystemRow | Record<string, unknown>
): Record<string, unknown> {
  return account as Record<string, unknown>
}

export function getAccountCoinWallet(
  account: Record<string, unknown>
): CoinWalletPayload | null | undefined {
  return (account.coin_wallets ?? account.accounts_coin_wallets) as
    | CoinWalletPayload
    | null
    | undefined
}

export function getAccountXpProfile(
  account: Record<string, unknown>
): XpProfilePayload | null | undefined {
  return (account.xp_profiles ?? account.accounts_xp_profiles) as
    | XpProfilePayload
    | null
    | undefined
}

export function getAccountBalance(
  account: Record<string, unknown>
): AccountBalance {
  const wallet = getAccountCoinWallet(account)
  const xp = getAccountXpProfile(account)
  return {
    coins: wallet?.coins_balance ?? 0,
    tokens: wallet?.tokens_balance ?? 0,
    xp: xp?.xp_total ?? 0,
    level: xp?.level ?? 1,
  }
}

/** Coins balance for leaderboard / stats (no coins_spent column in accountsystem.coin_wallets). */
export function getAccountTotalCoins(account: Record<string, unknown>): number {
  return getAccountCoinWallet(account)?.coins_balance ?? 0
}

/** Active if not soft-deleted (accounts table has no status column). */
export function getAccountDisplayStatus(account: Record<string, unknown>): string {
  if (account.is_deleted === true) return 'DELETED'
  return 'ACTIVE'
}

export function getAccountStatsSnapshot(account: Record<string, unknown>) {
  const balance = getAccountBalance(account)
  return {
    level: balance.level,
    xp: balance.xp,
    coins_balance: balance.coins,
  }
}
