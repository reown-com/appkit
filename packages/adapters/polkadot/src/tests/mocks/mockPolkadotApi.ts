import { vi } from 'vitest'

export const mockFormatBalance = vi.fn((value: string | bigint, opts?: any) => {
  const decimals = opts?.decimals ?? 10
  const num = BigInt(value.toString())
  const factor = 10n ** BigInt(decimals)
  const whole = num / factor
  const frac = num % factor
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '')
  return fracStr ? `${whole}.${fracStr}` : `${whole}`
})

export function installPolkadotApiMocks({
  accountFree = 1234560000000n,
  chainDecimals = 10,
  chainToken = 'DOT'
}: {
  accountFree?: bigint
  chainDecimals?: number
  chainToken?: string
} = {}) {
  const mockAccountInfo = { data: { free: accountFree } }

  const mockApi = {
    query: {
      system: {
        account: vi.fn().mockResolvedValue(mockAccountInfo)
      }
    },
    registry: {
      chainDecimals: [chainDecimals],
      chainTokens: [chainToken]
    }
  }

  const ApiPromise = {
    create: vi.fn().mockResolvedValue(mockApi)
  }

  const WsProvider = vi.fn()

  ;(window as any).__appkitPolkadotLibs = {
    ...(window as any).__appkitPolkadotLibs,
    ApiPromise,
    WsProvider,
    formatBalance: mockFormatBalance
  }

  return { ApiPromise, WsProvider, mockApi }
}
