import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectorController,
  ProviderController,
  type SignMessageContext
} from '@reown/appkit-controllers'
import { mockChainControllerState } from '@reown/appkit-controllers/testing'

import { AppKitBaseClient } from '../../src/client/appkit-base-client.js'
import { mockEvmAdapter } from '../mocks/Adapter.js'
import { mainnet, solana } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

class TestAppKit extends AppKitBaseClient {
  protected async injectModalUi(): Promise<void> {}
  public async syncIdentity(): Promise<void> {}

  public get testConnectionControllerClient() {
    return this.connectionControllerClient
  }
}

describe('AppKit message signing', () => {
  let appKit: TestAppKit

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()

    appKit = new TestAppKit(mockOptions)
  })

  it('uses the captured SIWX chain and account when the active namespace changes', async () => {
    const provider = { request: vi.fn() }
    const context: SignMessageContext = {
      chainId: mainnet.caipNetworkId,
      accountAddress: '0x1234567890123456789012345678901234567890',
      connectorId: 'walletConnect'
    }

    mockChainControllerState({
      activeChain: ConstantsUtil.CHAIN.SOLANA,
      activeCaipNetwork: solana
    })
    vi.spyOn(ChainController, 'getCaipNetworkById').mockReturnValue(mainnet)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('walletConnect')
    vi.spyOn(ProviderController, 'getProvider').mockReturnValue(provider)
    vi.spyOn(mockEvmAdapter, 'signMessage').mockResolvedValue({ signature: '0xsignature' })

    const result = await appKit.testConnectionControllerClient?.signMessage('Sign in', context)

    expect(ProviderController.getProvider).toHaveBeenCalledWith(ConstantsUtil.CHAIN.EVM)
    expect(mockEvmAdapter.signMessage).toHaveBeenCalledWith({
      message: 'Sign in',
      address: context.accountAddress,
      provider,
      caipNetwork: mainnet,
      connectorId: context.connectorId
    })
    expect(result).toBe('0xsignature')
  })

  it('stops signing if the captured connector has changed', async () => {
    const context: SignMessageContext = {
      chainId: mainnet.caipNetworkId,
      accountAddress: '0x1234567890123456789012345678901234567890',
      connectorId: 'walletConnect'
    }

    vi.spyOn(ChainController, 'getCaipNetworkById').mockReturnValue(mainnet)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('injected')

    await expect(
      appKit.testConnectionControllerClient?.signMessage('Sign in', context)
    ).rejects.toThrow('signMessage: connector changed before the request was sent')
    expect(mockEvmAdapter.signMessage).not.toHaveBeenCalled()
  })
})
