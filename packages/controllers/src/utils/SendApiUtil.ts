import type { CaipNetwork } from '@reown/appkit-common'

import { AccountController } from '../controllers/AccountController.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ERC7811Utils } from './ERC7811Util.js'
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

    // Extract EIP-155 specific logic
    if (caipNetwork.chainNamespace === 'eip155') {
      const eip155Balances = await this.getEIP155Balances(address, caipNetwork)
      if (eip155Balances) {
        return this.filterLowQualityTokens(eip155Balances)
      }
    }

    // Fallback to 1Inch API
    const response = await BlockchainApiController.getBalance(
      address,
      caipNetwork.caipNetworkId,
      forceUpdate
    )

    return this.filterLowQualityTokens(response.balances)
  },

  async getEIP155Balances(address: string, caipNetwork: CaipNetwork) {
    try {
      const chainIdHex = ERC7811Utils.getChainIdHexFromCAIP2ChainId(caipNetwork.caipNetworkId)
      const walletCapabilities = (await ConnectionController.getCapabilities(address)) as Record<
        string,
        { assetDiscovery?: { supported: boolean } }
      >

      if (!walletCapabilities?.[chainIdHex]?.['assetDiscovery']?.supported) {
        return null
      }

      const walletGetAssetsResponse = await ConnectionController.walletGetAssets({
        account: address as `0x${string}`,
        chainFilter: [chainIdHex]
      })

      if (!ERC7811Utils.isWalletGetAssetsResponse(walletGetAssetsResponse)) {
        return null
      }

      const assets = walletGetAssetsResponse[chainIdHex] || []

      return assets.map(asset => ERC7811Utils.createBalance(asset, caipNetwork.caipNetworkId))
    } catch (error) {
      return null
    }
  },

  /**
   * The 1Inch API includes many low-quality tokens in the balance response,
   * which appear inconsistently. This filter prevents them from being displayed.
   */
  filterLowQualityTokens(balances: BlockchainApiBalanceResponse['balances']) {
    return balances.filter(balance => balance.quantity.decimals !== '0')
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
