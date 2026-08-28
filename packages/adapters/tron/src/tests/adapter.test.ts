import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter'
import { WalletReadyState } from '@tronweb3/tronwallet-abstract-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChainController } from '@reown/appkit-controllers'

import { TronAdapter } from '../adapter'
import { TronConnectUtil } from '../utils/TronConnectUtil'

function createFakeAdapter(readyState: WalletReadyState): Adapter {
  return {
    name: 'FakeWallet',
    readyState,
    on: vi.fn(),
    removeListener: vi.fn()
  } as unknown as Adapter
}

describe('TronAdapter.syncConnectors', () => {
  beforeEach(() => {
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('awaits pending wallet adapters before resolving', async () => {
    const loading = createFakeAdapter(WalletReadyState.Loading)
    const adapter = new TronAdapter({ walletAdapters: [loading] })

    let waitResolved = false
    const waitSpy = vi.spyOn(TronConnectUtil, 'waitForLoadingAdapters').mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            waitResolved = true
            resolve()
          }, 0)
        })
    )

    await adapter.syncConnectors()

    expect(waitSpy).toHaveBeenCalledWith([loading])
    expect(waitResolved).toBe(true)
  })
})
