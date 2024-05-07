import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  AccountController,
  BlockchainApiController,
  NetworkController,
  SwapController,
  type CaipNetworkId,
  type NetworkControllerClient
} from '../../index.js'
import {
  balanceResponse,
  gasPriceResponse,
  networkTokenPriceResponse,
  tokensResponse
} from '../mocks/SwapController.js'
import { INITIAL_GAS_LIMIT } from '../../src/controllers/SwapController.js'
import { SwapApiUtil } from '../../src/utils/SwapApiUtil.js'

// - Mocks ---------------------------------------------------------------------
const mockTransaction = {
  data: '0x11111',
  gas: BigInt(INITIAL_GAS_LIMIT),
  gasPrice: BigInt(10000000000),
  to: '0x222',
  toAmount: '1',
  value: BigInt(1)
}
const caipNetwork = { id: 'eip155:137', name: 'Polygon' } as const
const approvedCaipNetworkIds = ['eip155:1', 'eip155:137'] as CaipNetworkId[]
const client: NetworkControllerClient = {
  switchCaipNetwork: async _caipNetwork => Promise.resolve(),
  getApprovedCaipNetworksData: async () =>
    Promise.resolve({ approvedCaipNetworkIds, supportsAllNetworks: false })
}
const caipAddress = 'eip155:1:0x123'
// MATIC
const networkTokenAddress = 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
// AVAX
const toTokenAddress = 'eip155:137:0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b'

// - Setup ---------------------------------------------------------------------
beforeAll(async () => {
  //  -- Set Account and
  NetworkController.setClient(client)
  await NetworkController.switchActiveNetwork(caipNetwork)
  AccountController.setCaipAddress(caipAddress)

  vi.spyOn(BlockchainApiController, 'getBalance').mockResolvedValue(balanceResponse)
  vi.spyOn(BlockchainApiController, 'fetchTokenPrice').mockResolvedValue(networkTokenPriceResponse)
  vi.spyOn(SwapApiUtil, 'getTokenList').mockResolvedValue(tokensResponse)
  vi.spyOn(SwapApiUtil, 'fetchGasPrice').mockResolvedValue(gasPriceResponse)
  vi.spyOn(SwapController, 'getTransaction').mockResolvedValue(mockTransaction)

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
    expect(SwapController.state.toTokenPriceInUSD).toEqual(38.0742530944)
  })

  it('should calculate swap values as expected', async () => {
    await SwapController.swapTokens()

    expect(SwapController.state.gasPriceInUSD).toEqual(0.0010485260814)
    expect(SwapController.state.priceImpact).toEqual(0.898544263592072)
    expect(SwapController.state.maxSlippage).toEqual(0.00019274639331006023)
  })

  it('should reset values as expected', () => {
    SwapController.resetValues()
    expect(SwapController.state.toToken).toEqual(undefined)
    expect(SwapController.state.toTokenAmount).toEqual('')
    expect(SwapController.state.toTokenPriceInUSD).toEqual(0)
  })
})
