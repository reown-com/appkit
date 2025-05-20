import type UniversalProvider from '@walletconnect/universal-provider'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import { AccountController } from '../controllers/AccountController.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { ERC7811Utils } from './ERC7811Util.js'
import { FetchUtil } from './FetchUtil.js'
import type {
  SwapTokenWithBalance,
  WalletGetAssetsParams,
  WalletGetAssetsResponse
} from './TypeUtil.js'
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
    if (caipNetwork.chainNamespace === ConstantsUtil.CHAIN.EVM) {
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

  async getAssetDiscoveryCapabilities({
    chainIdAsHex,
    userAddress
  }: {
    chainIdAsHex: `0x${string}`
    userAddress: string
  }): Promise<{
    hasAssetDiscovery: boolean
    hasWalletService: boolean
    walletServiceUrl?: string
  }> {
    try {
      const caipNetwork = ChainController.state.activeCaipNetwork
      if (!caipNetwork) {
        return {
          hasAssetDiscovery: false,
          hasWalletService: false
        }
      }
      const connectorId = ConnectorController.getConnectorId(caipNetwork.chainNamespace)

      // For WalletConnect, also check CAIP-25
      if (connectorId === ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
        const connector = ConnectorController.getConnectorById(connectorId)
        const provider = connector?.provider as UniversalProvider | undefined
        const evmScopedProperties = provider?.session?.scopedProperties?.[ConstantsUtil.CHAIN.EVM]
        const eip155Capabilities =
          typeof evmScopedProperties === 'string' ? JSON.parse(evmScopedProperties) : {}

        const walletService = Array.isArray(eip155Capabilities?.walletService)
          ? eip155Capabilities.walletService
          : []

        // Handle case where walletService is undefined or not an array
        if (!Array.isArray(walletService)) {
          return {
            hasAssetDiscovery: false,
            hasWalletService: false,
            walletServiceUrl: undefined
          }
        }

        const assetDiscoveryService = walletService.find(
          (service: { url: string; methods: string[] }) =>
            service?.methods?.includes('wallet_getAssets')
        )

        return {
          hasAssetDiscovery: Boolean(assetDiscoveryService),
          hasWalletService: Boolean(assetDiscoveryService?.url),
          walletServiceUrl: assetDiscoveryService?.url
        }
      }

      const walletCapabilities = (await ConnectionController.getCapabilities(
        userAddress
      )) as Record<string, { assetDiscovery?: { supported: boolean } }>

      const hasAssetDiscovery =
        walletCapabilities?.[chainIdAsHex]?.assetDiscovery?.supported ?? false

      return {
        hasAssetDiscovery,
        hasWalletService: false
      }
    } catch (error) {
      // Some wallet don't support wallet_getCapabilities and throws error when called
      return {
        hasAssetDiscovery: false,
        hasWalletService: false
      }
    }
  },

  async getAssetsViaWalletService(
    request: WalletGetAssetsParams,
    walletServiceUrl: string
  ): Promise<WalletGetAssetsResponse> {
    const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
    }

    const rpcRequest = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000),
      method: 'wallet_getAssets',
      params: request
    }

    // Create a new FetchUtil instance for this request
    const fetchUtil = new FetchUtil({
      baseUrl: walletServiceUrl,
      clientId: null
    })

    // Make the POST request using FetchUtil
    const response = await fetchUtil.post<{ result: WalletGetAssetsResponse }>({
      path: '',
      params: { projectId },
      body: rpcRequest,
      headers: { 'Content-Type': 'application/json' }
    })

    return response.result
  },

  async getEIP155Balances(address: string, caipNetwork: CaipNetwork) {
    try {
      const chainIdHex = ERC7811Utils.getChainIdHexFromCAIP2ChainId(caipNetwork.caipNetworkId)
      const connectorId = ConnectorController.getConnectorId(caipNetwork.chainNamespace)
      if (!connectorId) {
        return null
      }
      // Check wallet capabilities first
      const capabilities = await this.getAssetDiscoveryCapabilities({
        chainIdAsHex: chainIdHex,
        userAddress: address
      })
      let walletGetAssetsResponse: WalletGetAssetsResponse | null = null
      const request: WalletGetAssetsParams = {
        account: address as `0x${string}`,
        chainFilter: [chainIdHex]
      }

      if (capabilities.hasAssetDiscovery) {
        if (
          connectorId === ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT &&
          capabilities.hasWalletService &&
          capabilities.walletServiceUrl
        ) {
          // Use WalletService to fetch assets
          walletGetAssetsResponse = await this.getAssetsViaWalletService(
            request,
            capabilities.walletServiceUrl
          )
        } else {
          // Fallback to direct provider call
          walletGetAssetsResponse = await ConnectionController.walletGetAssets(request)
        }

        if (!ERC7811Utils.isWalletGetAssetsResponse(walletGetAssetsResponse)) {
          return null
        }
        const chainAssets = walletGetAssetsResponse[chainIdHex] || []
        if (chainAssets && chainAssets.length > 0) {
          return chainAssets.map(asset =>
            ERC7811Utils.createBalance(asset, caipNetwork.caipNetworkId)
          )
        }

        return null
      }

      return null
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
