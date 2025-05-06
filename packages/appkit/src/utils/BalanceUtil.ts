import type { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import type { AppKit } from '../client/appkit.js'

// Unified method for fetching balance for vue/react
export async function _internalFetchBalance(appKit: AppKit | undefined) {
  if (!appKit) {
    throw new Error('AppKit not initialized when fetchBalance was called.')
  }

  return await updateBalance(appKit)
}

export async function updateBalance(appKit: AppKit): Promise<{
  data: AdapterBlueprint.GetBalanceResult | undefined
  error: string | null
  isSuccess: boolean
  isError: boolean
}> {
  const balance = await appKit.fetchBalance()

  if (balance) {
    return {
      data: balance,
      error: null,
      isSuccess: true,
      isError: false
    }
  }

  return {
    data: undefined,
    error: 'No balance found',
    isSuccess: false,
    isError: true
  }
}
