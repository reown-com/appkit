import { beforeAll, describe, expect, it, vi } from 'vitest'
import { parseUnits } from 'viem'
import {
  AccountController,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  NetworkController,
  SwapController,
  type CaipNetworkId,
  type NetworkControllerClient
} from '../../index.js'
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
import { ConstantsUtil } from '@web3modal/common'

// - Mocks ---------------------------------------------------------------------
const caipNetwork = { id: 'eip155:137', name: 'Polygon', chain: ConstantsUtil.CHAIN.EVM } as const
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
  ChainController.initialize([{ chain: ConstantsUtil.CHAIN.EVM, networkControllerClient: client }])
  await NetworkController.switchActiveNetwork(caipNetwork)
  AccountController.setCaipAddress(caipAddress)

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
