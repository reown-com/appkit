import type { AdapterBlueprint } from '@reown/appkit-controllers'

import type { AppKit } from '../client/appkit.js'

// Unified method for fetching balance for vue/react
export async function _internalFetchBalance(appKit: AppKit | undefined) {
  if (!appKit) {
    throw new Error('AppKit not initialized when  fetchBalance was called.')
  }

  return await updateBalance(appKit)
}

export async function updateBalance(appKit: AppKit): Promise<{
  data: AdapterBlueprint.GetBalanceResult | undefined
  error: string | null
  isSuccess: boolean
  isError: boolean
}> {
  const address = appKit.getAddress()
  const chainNamespace = appKit.getActiveChainNamespace()
  const chainId = appKit.getCaipNetwork()?.id

  if (!address || !chainNamespace || !chainId) {
    return {
      data: undefined,
      error: 'Not able to retrieve balance',
      isSuccess: false,
      isError: true
    }
  }

  const balance = await appKit.updateNativeBalance(address, chainId, chainNamespace)

  return {
    data: balance,
    error: balance ? null : 'No balance found',
    isSuccess: Boolean(balance),
    isError: !balance
  }
}
