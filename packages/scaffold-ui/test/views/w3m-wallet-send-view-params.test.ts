import { fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import {
  type AccountState,
  AssetUtil,
  ChainController,
  ConstantsUtil,
  RouterController,
  SendController,
  SnackController
} from '@reown/appkit-controllers'
import { BalanceUtil } from '@reown/appkit-controllers/utils'

import { W3mWalletSendView } from '../../src/views/w3m-wallet-send-view'

let originalAnimate: any

const mockAddress = '0x1234567890123456789012345678901234567890'
const mockValidParams = {
  namespace: 'eip155' as ChainNamespace,
  chainId: '1',
  assetAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  amount: '10.5',
  to: '0x9876543210987654321098765432109876543210'
}
const mockMainnet = {
  id: '1',
  name: 'Mainnet',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1' as const,
  nativeCurrency: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY']
    }
  }
} as CaipNetwork

describe('W3mWalletSendView - parameters handling', () => {
  beforeEach(() => {
    originalAnimate = Element.prototype.animate
    Element.prototype.animate = vi.fn().mockImplementation(function () {
      return {}
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      address: mockAddress,
      caipAddress: `eip155:1:${mockAddress}`
    } as unknown as AccountState)

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        send: mockValidParams
      }
    })
    vi.spyOn(BalanceUtil, 'fetchERC20Balance').mockResolvedValue({
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      balance: '100'
    })
    vi.spyOn(ChainController, 'getCaipNetworkById').mockReturnValue(mockMainnet)
    vi.spyOn(AssetUtil, 'getTokenImage').mockReturnValue('')
    vi.spyOn(SnackController, 'showError').mockImplementation(() => {})
    vi.spyOn(SendController, 'setToken').mockImplementation(() => {})
    vi.spyOn(SendController, 'setTokenAmount').mockImplementation(() => {})
    vi.spyOn(SendController, 'setReceiverAddress').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    Element.prototype.animate = originalAnimate
  })

  it('should handle valid send parameters successfully', async () => {
    vi.spyOn(ConstantsUtil, 'SEND_PARAMS_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155'])

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await vi.waitFor(() => {
      expect(BalanceUtil.fetchERC20Balance).toHaveBeenCalledWith({
        caipAddress: `eip155:1:${mockAddress}`,
        assetAddress: mockValidParams.assetAddress,
        caipNetwork: mockMainnet
      })
    })

    expect(SendController.setToken).toHaveBeenCalledWith({
      name: 'Test Token',
      symbol: 'TEST',
      chainId: mockMainnet.id,
      address: 'eip155:1:0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      value: 0,
      price: 0,
      quantity: {
        decimals: '18',
        numeric: '100'
      },
      iconUrl: ''
    })

    expect(SendController.setTokenAmount).toHaveBeenCalledWith(10.5)
    expect(SendController.setReceiverAddress).toHaveBeenCalledWith(mockValidParams.to)
  })

  it('should handle invalid amount parameter', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        send: {
          ...mockValidParams,
          amount: 'invalid-amount'
        }
      }
    })

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await vi.waitFor(() => {
      expect(SnackController.showError).toHaveBeenCalledWith('Invalid amount')
    })

    expect(BalanceUtil.fetchERC20Balance).not.toHaveBeenCalled()
    expect(SendController.setToken).not.toHaveBeenCalled()
  })

  it('should handle unsupported chain namespace', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        send: {
          ...mockValidParams,
          namespace: 'unsupported' as ChainNamespace
        }
      }
    })

    vi.spyOn(ConstantsUtil, 'SEND_PARAMS_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155'])

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await vi.waitFor(() => {
      expect(SnackController.showError).toHaveBeenCalledWith(
        'Chain "unsupported" is not supported for send parameters'
      )
    })

    expect(BalanceUtil.fetchERC20Balance).not.toHaveBeenCalled()
    expect(SendController.setToken).not.toHaveBeenCalled()
  })

  it('should handle token not found scenario', async () => {
    vi.spyOn(BalanceUtil, 'fetchERC20Balance').mockResolvedValue({
      name: undefined,
      symbol: undefined,
      decimals: undefined,
      balance: '0'
    })

    vi.spyOn(ConstantsUtil, 'SEND_PARAMS_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155'])

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await vi.waitFor(() => {
      expect(SnackController.showError).toHaveBeenCalledWith('Token not found')
    })

    expect(SendController.setToken).not.toHaveBeenCalled()
  })

  it('should handle network error during token fetch', async () => {
    const networkError = new Error('Network error')
    vi.spyOn(BalanceUtil, 'fetchERC20Balance').mockRejectedValue(networkError)

    vi.spyOn(ConstantsUtil, 'SEND_PARAMS_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155'])

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await vi.waitFor(() => {
      expect(SnackController.showError).toHaveBeenCalledWith('Failed to load token information')
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load token information:', networkError)
    expect(SendController.setToken).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should not process when params is null', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        send: undefined
      }
    })

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(BalanceUtil.fetchERC20Balance).not.toHaveBeenCalled()
    expect(SendController.setToken).not.toHaveBeenCalled()
    expect(SnackController.showError).not.toHaveBeenCalled()
  })

  it('should handle different decimal values correctly', async () => {
    vi.spyOn(BalanceUtil, 'fetchERC20Balance').mockResolvedValue({
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      balance: '1000000'
    })

    vi.spyOn(ConstantsUtil, 'SEND_PARAMS_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155'])

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await vi.waitFor(() => {
      expect(SendController.setToken).toHaveBeenCalledWith({
        name: 'USD Coin',
        symbol: 'USDC',
        chainId: mockMainnet.id,
        address: 'eip155:1:0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: 0,
        price: 0,
        quantity: {
          decimals: '6',
          numeric: '1000000'
        },
        iconUrl: ''
      })
    })
  })

  it('should handle zero balance correctly', async () => {
    vi.spyOn(BalanceUtil, 'fetchERC20Balance').mockResolvedValue({
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      balance: '0'
    })

    vi.spyOn(ConstantsUtil, 'SEND_PARAMS_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155'])

    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    await vi.waitFor(() => {
      expect(SendController.setToken).toHaveBeenCalledWith({
        name: 'Test Token',
        symbol: 'TEST',
        chainId: mockMainnet.id,
        address: 'eip155:1:0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: 0,
        price: 0,
        quantity: {
          decimals: '18',
          numeric: '0'
        },
        iconUrl: ''
      })
    })
  })
})
