import UniversalProvider from '@walletconnect/universal-provider'
import { describe, expect, it, vi } from 'vitest'

import { OptionsController } from '@reown/appkit-core'

import { AppKit } from '../../src/client'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter'
import { mockOptions } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

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
    const setUsingInjectedUniversalProvider = vi.spyOn(
      OptionsController,
      'setUsingInjectedUniversalProvider'
    )

    new AppKit({
      ...mockOptions,
      universalProvider: mockUniversalProvider
    })

    // Wait for the promise to fetchIdentity to resolve
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(init).not.toHaveBeenCalled()
    expect(setUsingInjectedUniversalProvider).toHaveBeenCalled()
  })

  it('should initialize multiple adapters for different namespaces', async () => {
    new AppKit({
      ...mockOptions,
      universalProvider: mockUniversalProvider
    })

    expect(mockEvmAdapter.syncConnectors).toHaveBeenCalled()
    expect(mockSolanaAdapter.syncConnectors).toHaveBeenCalled()
  })

  it('should set universal provider and auth provider for each adapter', async () => {
    new AppKit({
      ...mockOptions,
      universalProvider: mockUniversalProvider
    })

    expect(mockEvmAdapter.setUniversalProvider).toHaveBeenCalled()
    expect(mockEvmAdapter.setAuthProvider).toHaveBeenCalled()
    expect(mockSolanaAdapter.setUniversalProvider).toHaveBeenCalled()
    expect(mockSolanaAdapter.setAuthProvider).toHaveBeenCalled()
  })
})
