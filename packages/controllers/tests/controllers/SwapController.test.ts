import { parseUnits } from 'viem'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'

import {
  AccountController,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  type ConnectionControllerClient,
  ConnectorController,
  type NetworkControllerClient,
  RouterController,
  SwapController
} from '../../exports/index.js'
import { SwapApiUtil } from '../../src/utils/SwapApiUtil.js'
import {
  allowanceResponse,
  balanceResponse,
  gasPriceResponse,
  networkTokenPriceResponse,
  swapCalldataResponse,
  swapQuoteResponse,
  tokensResponse
} from '../mocks/SwapController.js'

// - Mocks ---------------------------------------------------------------------
const caipNetwork = {
  id: 137,
  caipNetworkId: 'eip155:137',
  name: 'Polygon',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  nativeCurrency: {
    name: 'Polygon',
    decimals: 18,
    symbol: 'MATIC'
  },
  rpcUrls: {
    default: {
      http: ['']
    }
  }
} as CaipNetwork
const approvedCaipNetworkIds = ['eip155:1', 'eip155:137'] as CaipNetworkId[]
const client: NetworkControllerClient = {
  switchCaipNetwork: async _caipNetwork => Promise.resolve(),
  getApprovedCaipNetworksData: async () =>
    Promise.resolve({ approvedCaipNetworkIds, supportsAllNetworks: false })
}
const chain = ConstantsUtil.CHAIN.EVM
const caipAddress = 'eip155:1:0x123'
// MATIC
const networkTokenAddress = 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
// AVAX
const toTokenAddress = 'eip155:137:0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b'

const sourceTokenAmount = '1'

// - Setup ---------------------------------------------------------------------
beforeAll(async () => {
  const mockAdapter = {
    namespace: ConstantsUtil.CHAIN.EVM,
    networkControllerClient: client,
    caipNetworks: [caipNetwork]
  }
  ChainController.initialize([mockAdapter], [caipNetwork], {
    connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
    networkControllerClient: client
  })

  ChainController.setActiveCaipNetwork(caipNetwork)
  AccountController.setCaipAddress(caipAddress, chain)
  vi.spyOn(BlockchainApiController, 'fetchSwapTokens').mockResolvedValue(tokensResponse)
  vi.spyOn(BlockchainApiController, 'getBalance').mockResolvedValue(balanceResponse)
  vi.spyOn(BlockchainApiController, 'fetchSwapQuote').mockResolvedValue(swapQuoteResponse)
  vi.spyOn(BlockchainApiController, 'fetchTokenPrice').mockResolvedValue(networkTokenPriceResponse)
  vi.spyOn(BlockchainApiController, 'generateSwapCalldata').mockResolvedValue(swapCalldataResponse)
  vi.spyOn(BlockchainApiController, 'fetchSwapAllowance').mockResolvedValue(allowanceResponse)
  vi.spyOn(SwapApiUtil, 'fetchGasPrice').mockResolvedValue(gasPriceResponse)
  vi.spyOn(ConnectionController, 'parseUnits').mockResolvedValue(parseUnits('1', 18))

  await SwapController.initializeState()
  await SwapController.getTokenList()

  const toToken = SwapController.state.myTokensWithBalance?.[1]
  SwapController.setToToken(toToken)
})

// -- Tests --------------------------------------------------------------------
describe('SwapController', () => {
  it('should set sourceToken as expected', () => {
    expect(SwapController.state.sourceToken?.address).toEqual(networkTokenAddress)
  })

  it('should set toToken as expected', () => {
    expect(SwapController.state.toToken?.address).toEqual(toTokenAddress)
    expect(SwapController.state.toTokenPriceInUSD).toEqual(40.101925674)
  })

  it('should calculate swap values as expected', async () => {
    SwapController.setSourceTokenAmount(sourceTokenAmount)

    await SwapController.swapTokens()

    expect(SwapController.state.gasPriceInUSD).toEqual(0.00648630001383744)
    expect(SwapController.state.priceImpact).toEqual(3.952736601951709)
    expect(SwapController.state.maxSlippage).toEqual(0.0001726)
  })

  it('should handle fetchSwapQuote error correctly', async () => {
    SwapController.resetState()

    const mockFetchQuote = vi.spyOn(BlockchainApiController, 'fetchSwapQuote')
    mockFetchQuote.mockRejectedValueOnce(new Error('Quote error'))

    const sourceToken = SwapController.state.tokens?.[0]
    const toToken = SwapController.state.tokens?.[1]
    SwapController.setSourceToken(sourceToken)
    SwapController.setToToken(toToken)
    SwapController.setSourceTokenAmount('1')

    await SwapController.swapTokens()

    expect(mockFetchQuote).toHaveBeenCalled()
    expect(SwapController.state.loadingQuote).toBe(false)
    expect(SwapController.state.inputError).toBe('Insufficient balance')
  })

  it('should reset values as expected', () => {
    SwapController.resetValues()
    expect(SwapController.state.toToken).toEqual(undefined)
    expect(SwapController.state.toTokenAmount).toEqual('')
    expect(SwapController.state.toTokenPriceInUSD).toEqual(0)
  })

  it('should clear to token amount when source token amount is cleared', async () => {
    SwapController.setSourceTokenAmount('1.0')
    await SwapController.swapTokens()
    const toTokenAmount = Number(SwapController.state.toTokenAmount)
    expect(toTokenAmount).toBeGreaterThan(0)
    SwapController.setSourceTokenAmount('')
    await SwapController.swapTokens()
    expect(SwapController.state.toTokenAmount).toEqual('')
  })

  it('should replace SwapPreview view when approval transaction is approved', async () => {
    const connectionControllerClientSpy = vi
      .spyOn(ConnectionController, 'sendTransaction')
      .mockImplementationOnce(() => Promise.resolve(null))
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('ID_AUTH')
    vi.spyOn(RouterController, 'pushTransactionStack').mockImplementationOnce(() =>
      Promise.resolve()
    )
    const onEmbeddedWalletApprovalSuccessSpy = vi.spyOn(
      SwapController,
      'onEmbeddedWalletApprovalSuccess'
    )
    SwapController.state.approvalTransaction = {
      to: '0x123',
      data: '0x123',
      value: 10000n,
      toAmount: '1'
    }
    await SwapController.sendTransactionForApproval(SwapController.state.approvalTransaction)
    expect(connectionControllerClientSpy).toHaveBeenCalled()
    expect(RouterController.pushTransactionStack).toHaveBeenCalledWith({
      onSuccess: onEmbeddedWalletApprovalSuccessSpy
    })
  })
})
