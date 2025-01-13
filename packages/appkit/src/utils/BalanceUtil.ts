import type { Balance } from '@reown/appkit-common'
import type { AppKit } from '../client.js'

export async function fetchBalance(appKit: AppKit): Promise<{
  data: Balance | undefined
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
