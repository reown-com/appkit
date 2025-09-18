import { erc20Abi, formatUnits } from 'viem'

import {
  type Address,
  type CaipAddress,
  type CaipNetwork,
  ConstantsUtil,
  ParseUtil
} from '@reown/appkit-common'

import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { ERC7811Utils } from './ERC7811Util.js'
import { StorageUtil } from './StorageUtil.js'
import type { BlockchainApiBalanceResponse } from './TypeUtil.js'
import { ViemUtil } from './ViemUtil.js'

// -- Types -------------------------------------------------------------------- //
interface FetchER20BalanceParams {
  caipAddress: CaipAddress
  assetAddress: string
  caipNetwork: CaipNetwork
}

// -- Controller ---------------------------------------- //
export const BalanceUtil = {
  /**
   * Get the balances of the user's tokens. If user connected with Auth provider or and on the EIP155 network,
   * it'll use the `wallet_getAssets` and `wallet_getCapabilities` calls to fetch the balance rather than Blockchain API
   * @param forceUpdate - If true, the balances will be fetched from the server
   * @returns The balances of the user's tokens
   */
  async getMyTokensWithBalance(
    forceUpdate?: string
  ): Promise<BlockchainApiBalanceResponse['balances']> {
    const address = ChainController.getAccountData()?.address
    const caipNetwork = ChainController.state.activeCaipNetwork
    const isAuthConnector =
      ConnectorController.getConnectorId('eip155') === ConstantsUtil.CONNECTOR_ID.AUTH

    if (!address || !caipNetwork) {
      return []
    }

    const caipAddress = `${caipNetwork.caipNetworkId}:${address}`
    const cachedBalance = StorageUtil.getBalanceCacheForCaipAddress(caipAddress)

    if (cachedBalance) {
      return cachedBalance.balances
    }

    // Extract EIP-155 specific logic
    if (caipNetwork.chainNamespace === ConstantsUtil.CHAIN.EVM && isAuthConnector) {
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

  /**
   * Get the balances of the user's tokens on the EIP155 network using native `wallet_getAssets` and `wallet_getCapabilities` calls
   * @param address - The address of the user
   * @param caipNetwork - The CAIP network
   * @returns The balances of the user's tokens on the EIP155 network
   */
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
        account: address as Address,
        chainFilter: [chainIdHex]
      })

      if (!ERC7811Utils.isWalletGetAssetsResponse(walletGetAssetsResponse)) {
        return null
      }

      const assets = walletGetAssetsResponse[chainIdHex] || []
      const filteredAssets = assets.map(asset =>
        ERC7811Utils.createBalance(asset, caipNetwork.caipNetworkId)
      )

      StorageUtil.updateBalanceCache({
        caipAddress: `${caipNetwork.caipNetworkId}:${address}`,
        balance: { balances: filteredAssets },
        timestamp: Date.now()
      })

      return filteredAssets
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
  async fetchERC20Balance({ caipAddress, assetAddress, caipNetwork }: FetchER20BalanceParams) {
    const publicClient = await ViemUtil.createViemPublicClient(caipNetwork)

    const { address } = ParseUtil.parseCaipAddress(caipAddress)

    const [{ result: name }, { result: symbol }, { result: balance }, { result: decimals }] =
      await publicClient.multicall({
        contracts: [
          {
            address: assetAddress as Address,
            functionName: 'name',
            args: [],
            abi: erc20Abi
          },
          {
            address: assetAddress as Address,
            functionName: 'symbol',
            args: [],
            abi: erc20Abi
          },
          {
            address: assetAddress as Address,
            functionName: 'balanceOf',
            args: [address as Address],
            abi: erc20Abi
          },
          {
            address: assetAddress as Address,
            functionName: 'decimals',
            args: [],
            abi: erc20Abi
          }
        ]
      })

    return {
      name,
      symbol,
      decimals,
      balance: balance && decimals ? formatUnits(balance, decimals) : '0'
    }
  }
}
