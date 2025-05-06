import type { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import type { AppKit } from '../client/appkit.js'

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
