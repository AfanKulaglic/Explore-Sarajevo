/* eslint-disable @typescript-eslint/no-explicit-any */
type AccountsSchema = any

/** Resolve central account row from Supabase Auth user email. */
export async function resolveAccountId(
  accounts: AccountsSchema,
  email: string
): Promise<string | null> {
  const { data, error } = await accounts
    .from('accounts')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('[rewards] Account lookup failed:', error)
    return null
  }
  return data?.id ?? null
}

async function getExplorePlatformId(accounts: AccountsSchema): Promise<string | null> {
  const { data: platform } = await accounts
    .from('platforms')
    .select('id')
    .eq('code', 'EXPLORE')
    .maybeSingle()

  return platform?.id ?? null
}

/** Credit coins to accountsystem.coin_wallets and log activity_events. */
export async function grantExploreCoins(
  accounts: AccountsSchema,
  accountId: string,
  amount: number,
  reason: string,
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const { data: wallet, error: walletError } = await accounts
      .from('coin_wallets')
      .select('coins_balance')
      .eq('account_id', accountId)
      .single()

    if (walletError || !wallet) {
      console.error('[rewards] Wallet not found:', walletError)
      return false
    }

    const { error: updateError } = await accounts
      .from('coin_wallets')
      .update({ coins_balance: (wallet.coins_balance ?? 0) + amount })
      .eq('account_id', accountId)

    if (updateError) {
      console.error('[rewards] Failed to update wallet:', updateError)
      return false
    }

    const platformId = await getExplorePlatformId(accounts)
    if (platformId) {
      await accounts.from('activity_events').insert({
        account_id: accountId,
        platform_id: platformId,
        coins_delta: amount,
        tokens_delta: 0,
        xp_delta: 0,
        metadata: { reason, ...metadata },
      })
    }

    return true
  } catch (error) {
    console.error('[rewards] grantExploreCoins error:', error)
    return false
  }
}
