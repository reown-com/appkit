import UniversalProvider from '@walletconnect/universal-provider'
import { describe, expect, it, vi } from 'vitest'

import { OptionsController } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('Universal Adapter', () => {
  it('should create UniversalAdapter when no blueprint is provided for namespace', async () => {
    const init = vi.spyOn(UniversalProvider, 'init').mockImplementationOnce(vi.fn())

    new AppKit({ ...mockOptions, adapters: [] })

    expect(init).toHaveBeenCalledOnce()
  })

  it('should not initialize UniversalProvider when provided in options', async () => {
    const init = vi.spyOn(UniversalProvider, 'init')
    const setManualWcControl = vi.spyOn(OptionsController, 'setManualWCControl')

    new AppKit({
      ...mockOptions,
      // @ts-expect-error - ts will be handled
      universalProvider: mockUniversalProvider
    })

    // Wait for the promise to fetchIdentity to resolve
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(init).not.toHaveBeenCalled()
    expect(setManualWcControl).toHaveBeenCalled()
  })

  it('should initialize multiple adapters for different namespaces', async () => {
    new AppKit(mockOptions)

    expect(mockEvmAdapter.syncConnectors).toHaveBeenCalled()
    expect(mockSolanaAdapter.syncConnectors).toHaveBeenCalled()
  })

  it('should set universal provider and auth provider for each adapter', async () => {
    new AppKit(mockOptions)

    expect(mockEvmAdapter.setUniversalProvider).toHaveBeenCalled()
    expect(mockEvmAdapter.setAuthProvider).toHaveBeenCalled()
    expect(mockSolanaAdapter.setUniversalProvider).toHaveBeenCalled()
    expect(mockSolanaAdapter.setAuthProvider).toHaveBeenCalled()
  })
})
