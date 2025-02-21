import { AccountController } from '../controllers/AccountController.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import {
  ERC7811Utils,
  type WalletGetAssetsRequest,
  type WalletGetAssetsResponse
} from './ERC7811Util.js'
import type { SwapTokenWithBalance } from './TypeUtil.js'
import type { BlockchainApiBalanceResponse } from './TypeUtil.js'

// -- Controller ---------------------------------------- //
export const SendApiUtil = {
  async getMyTokensWithBalance(
    forceUpdate?: string
  ): Promise<BlockchainApiBalanceResponse['balances']> {
    const address = AccountController.state.address
    const caipNetwork = ChainController.state.activeCaipNetwork

    if (!address || !caipNetwork) {
      return []
    }
    let balances = []
    if (caipNetwork.chainNamespace === 'eip155') {
      const chainIdHex = ERC7811Utils.getChainIdHexFromCAIP2ChainId(caipNetwork.caipNetworkId)

      const walletCapabilities = (await ConnectionController.getCapabilities(address)) as Record<
        string,
        { assetDiscovery?: { supported: boolean } }
      >

      if (walletCapabilities?.[chainIdHex]?.['assetDiscovery']?.supported) {
        const walletGetAssetRequest: WalletGetAssetsRequest = {
          account: address as `0x${string}`,
          chainFilter: [chainIdHex]
        }

        const walletGetAssetsResponse = (await ConnectionController.walletGetAssets([
          walletGetAssetRequest
        ])) as WalletGetAssetsResponse

        const assets = walletGetAssetsResponse[chainIdHex] || []
        balances = assets.map(asset => ERC7811Utils.createBalance(asset, caipNetwork.caipNetworkId))
        const filteredBalances = balances.filter(balance => balance.quantity.decimals !== '0')

        return filteredBalances
      }
    }
    const response = await BlockchainApiController.getBalance(
      address,
      caipNetwork.caipNetworkId,
      forceUpdate
    )
    balances = response.balances

    const filteredBalances = balances.filter(balance => balance.quantity.decimals !== '0')

    return filteredBalances
  },

  mapBalancesToSwapTokens(balances: BlockchainApiBalanceResponse['balances']) {
    return (
      balances?.map(
        token =>
          ({
            ...token,
            address: token?.address
              ? token.address
              : ChainController.getActiveNetworkTokenAddress(),
            decimals: parseInt(token.quantity.decimals, 10),
            logoUri: token.iconUrl,
            eip2612: false
          }) as SwapTokenWithBalance
      ) || []
    )
  }
}
