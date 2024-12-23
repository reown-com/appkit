import { beforeAll, describe, expect, it, vi } from 'vitest'
import { parseUnits } from 'viem'
import {
  AccountController,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  SwapController,
  type NetworkControllerClient
} from '../../exports/index.js'
import type { CaipNetworkId, CaipNetwork } from '@reown/appkit-common'
import {
  allowanceResponse,
  balanceResponse,
  gasPriceResponse,
  networkTokenPriceResponse,
  swapCalldataResponse,
  swapQuoteResponse,
  tokensResponse
} from '../mocks/SwapController.js'
import { SwapApiUtil } from '../../src/utils/SwapApiUtil.js'
import { ConstantsUtil } from '@reown/appkit-common'

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

// - Setup ---------------------------------------------------------------------
beforeAll(async () => {
  //  -- Set Account and
  ChainController.initialize(
    [
      {
        namespace: ConstantsUtil.CHAIN.EVM,
        networkControllerClient: client,
        caipNetworks: [caipNetwork]
      }
    ],
    []
  )

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
    await SwapController.swapTokens()

    expect(SwapController.state.gasPriceInUSD).toEqual(0.00648630001383744)
    expect(SwapController.state.priceImpact).toEqual(3.952736601951709)
    expect(SwapController.state.maxSlippage).toEqual(0.0001726)
  })

  it('should reset values as expected', () => {
    SwapController.resetValues()
    expect(SwapController.state.toToken).toEqual(undefined)
    expect(SwapController.state.toTokenAmount).toEqual('')
    expect(SwapController.state.toTokenPriceInUSD).toEqual(0)
  })
})
