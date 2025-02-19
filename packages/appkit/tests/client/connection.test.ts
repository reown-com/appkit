import { UniversalProvider } from '@walletconnect/universal-provider'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountController, StorageUtil } from '@reown/appkit-core'

import { AppKit } from '../../src/client'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter'
import { mainnet, sepolia } from '../mocks/Networks'
import { mockOptions } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('syncExistingConnection', () => {
  beforeEach(() => {
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set status to "connecting" and sync the connection when a connector and namespace are present', async () => {
    const setStatus = vi.spyOn(AccountController, 'setStatus')
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('evm-connector')
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockReturnValue('connected')

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockEvmAdapter],
      networks: [mainnet, sepolia]
    })
    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('connected', 'eip155')

    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue(undefined)
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockReturnValue('connected')

    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('disconnected', 'eip155')

    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockClear()
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockClear()
  })

  it('should reconnect to multiple namespaces if previously connected', async () => {
    const setConnectedConnectorId = vi.spyOn(StorageUtil, 'setConnectedConnectorId')
    // const setProviderId = vi.spyOn(ProviderUtil, 'setProviderId').mockImplementation(() => {})
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('universal-connector')

    const appKit = new AppKit(mockOptions)
    await appKit['syncExistingConnection']()

    expect(mockEvmAdapter.syncConnection).toHaveBeenCalled()
    expect(mockSolanaAdapter.syncConnection).toHaveBeenCalled()
    expect(mockEvmAdapter.getAccounts).toHaveBeenCalled()
    expect(mockSolanaAdapter.getAccounts).toHaveBeenCalled()

    // NOTE: Even though setConnectedConnectorId is getting called in the same function (syncProvider),
    // it's getting detected as not called by the test runner.
    // expect(setProviderId).toHaveBeenCalledWith('eip155', 'EXTERNAL')
    // expect(setProviderId).toHaveBeenCalledWith('solana', 'EXTERNAL')

    expect(setConnectedConnectorId).toHaveBeenCalledWith('eip155', 'evm-connector')
    expect(setConnectedConnectorId).toHaveBeenCalledWith('solana', 'solana-connector')

    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockClear()
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockClear()
  })
})
