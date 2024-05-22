import { beforeAll, describe, expect, it, vi } from 'vitest'
import { parseUnits } from 'viem'
import {
  AccountController,
  BlockchainApiController,
  ConnectionController,
  NetworkController,
  SwapController,
  type CaipNetworkId,
  type NetworkControllerClient
} from '../../index.js'
import {
  balanceResponse,
  gasPriceResponse,
  networkTokenPriceResponse,
  swapCalldataResponse,
  swapQuoteResponse,
  tokensResponse
} from '../mocks/SwapController.js'
import { SwapApiUtil } from '../../src/utils/SwapApiUtil.js'

// - Mocks ---------------------------------------------------------------------

const mockTX = {
  tx: {
    from: 'eip155:137:0xe8e0d27a1232ada1d76ac4032a100f8f9f3486b2',
    to: 'eip155:137:0x111111125421ca6dc452d289314280a0f8842a65',
    data: '0x07ed2379000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd09000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000d6df932a45c0f255f85145f286ea0b292b21c90b000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd09000000000000000000000000e8e0d27a1232ada1d76ac4032a100f8f9f3486b20000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000001a5256ff077cbc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000014900000000000000000000000000000000012b0000fd00006e00005400004e802026678dcd00000000000000000000000000000000000000003e26ca57697d2ad49edd5c3787256586d0b50525000000000000000000000000000000000000000000000000001e32b47897400000206b4be0b940410d500b1d8e8ef31e21c99d1db9a6444d3adf1270d0e30db00c200d500b1d8e8ef31e21c99d1db9a6444d3adf12707d88d931504d04bfbee6f9745297a93063cab24c6ae40711b8002dc6c07d88d931504d04bfbee6f9745297a93063cab24c111111125421ca6dc452d289314280a0f8842a65000000000000000000000000000000000000000000000000001a5256ff077cbc0d500b1d8e8ef31e21c99d1db9a6444d3adf12700020d6bdbf78d6df932a45c0f255f85145f286ea0b292b21c90b111111125421ca6dc452d289314280a0f8842a6500000000000000000000000000000000000000000000003bd94e2a',
    amount: '7483720195780716',
    eip155: {
      gas: '253421',
      gasPrice: '151168582876'
    }
  }
}
const mockAllowance = {
  allowance: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
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

  vi.spyOn(BlockchainApiController, 'fetchSwapTokens').mockResolvedValue(tokensResponse)
  vi.spyOn(BlockchainApiController, 'getBalance').mockResolvedValue(balanceResponse)
  vi.spyOn(BlockchainApiController, 'fetchSwapQuote').mockResolvedValue(swapQuoteResponse)
  vi.spyOn(BlockchainApiController, 'fetchTokenPrice').mockResolvedValue(networkTokenPriceResponse)
  vi.spyOn(BlockchainApiController, 'generateSwapCalldata').mockResolvedValue(swapCalldataResponse)
  vi.spyOn(BlockchainApiController, 'fetchSwapAllowance').mockResolvedValue(mockAllowance)
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
