/* eslint-disable no-console */
import * as React from 'react'

import UniversalProvider from '@walletconnect/universal-provider'
import { RpcRequest } from 'ox'
import { type Hex, type PublicClient, createPublicClient, erc20Abi, http } from 'viem'

import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import type { GetCapabilitiesResult } from '../types/EIP5792'
import type { Asset, WalletGetAssetsRPCRequest, WalletGetAssetsRPCResponse } from '../types/ERC7811'
import { usdcTokenAddresses, usdtTokenAddresses } from '../utils/CATokensUtil'
import { convertChainIdToHex, formatBalance } from '../utils/ERC7811Util'
import { getChain } from '../utils/NetworksUtil'

export interface TokenBalance {
  symbol: string
  balance: string
  address: Hex
}

interface TokenConfig {
  symbol: string
  decimals: number
  address: Hex
}
interface WalletAssetsContextType {
  balances: TokenBalance[]
  isLoading: boolean
  refetch: () => Promise<void>
  getBalanceBySymbol: (symbol: string) => string
  getBalanceByAddress: (address: Hex) => string
}
const WalletAssetsContext = React.createContext<WalletAssetsContextType | undefined>(undefined)

export function WalletGetAssetsProvider({ children }: { children: React.ReactNode }) {
  const { address, status } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { walletProvider, walletProviderType } = useAppKitProvider<UniversalProvider>('eip155')
  const [balances, setBalances] = React.useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const processAssetsToBalances = React.useCallback(
    (chainAssets: Asset[]): TokenBalance[] =>
      chainAssets.map(asset => ({
        symbol: asset.metadata.symbol,
        balance: formatBalance(BigInt(asset.balance), asset.metadata.decimals),
        address: asset.address as Hex
      })),
    []
  )

  const getAssetDiscoveryCapabilities = React.useCallback(
    async (
      provider: UniversalProvider,
      chainIdAsHex: Hex,
      userAddress: string
    ): Promise<{
      hasAssetDiscovery: boolean
      hasWalletService: boolean
      walletServiceUrl?: string
    }> => {
      try {
        const capabilities: GetCapabilitiesResult = await provider.request({
          method: 'wallet_getCapabilities',
          params: [userAddress]
        })

        const hasAssetDiscovery = capabilities[chainIdAsHex]?.assetDiscovery?.supported ?? false
        if (!hasAssetDiscovery) {
          return {
            hasAssetDiscovery: false,
            hasWalletService: false
          }
        }
        // For WalletConnect, also check CAIP-25
        let walletServiceUrl: string | undefined = undefined
        if (walletProviderType === 'WALLET_CONNECT') {
          const sessionCapabilities = JSON.parse(
            provider.session?.sessionProperties?.['capabilities'] || '{}'
          )
          walletServiceUrl =
            sessionCapabilities[chainIdAsHex]?.['walletService']?.['wallet_getAssets']
        }

        return {
          hasAssetDiscovery,
          hasWalletService: Boolean(walletServiceUrl),
          walletServiceUrl
        }
      } catch (error) {
        console.error('Error checking wallet capabilities:', error)

        return {
          hasAssetDiscovery: false,
          hasWalletService: false
        }
      }
    },
    [walletProviderType]
  )

  const getAssetsViaWalletService = React.useCallback(
    async (
      request: WalletGetAssetsRPCRequest,
      walletServiceUrl: string
    ): Promise<Record<Hex, Asset[]>[]> => {
      const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
      if (!projectId) {
        throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
      }
      const store = RpcRequest.createStore()
      const rpcRequest = store.prepare({
        method: 'wallet_getAssets',
        params: [request]
      })

      const url = new URL(walletServiceUrl)
      url.searchParams.set('projectId', projectId)

      const response = await fetch(url.toString(), {
        body: JSON.stringify(rpcRequest),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const { result } = (await response.json()) as WalletGetAssetsRPCResponse

      return result
    },
    []
  )

  const getAssetsViaProvider = React.useCallback(
    async (
      provider: UniversalProvider,
      request: WalletGetAssetsRPCRequest
    ): Promise<Record<Hex, Asset[]>[]> => {
      const response: Record<Hex, Asset[]> = await provider.request({
        method: 'wallet_getAssets',
        params: [request]
      })

      return [response]
    },
    []
  )

  // Helper function to fetch ERC20 token balance
  async function fetchTokenBalance({
    publicClient,
    userAddress,
    tokenConfig
  }: {
    publicClient: PublicClient
    userAddress: Hex
    tokenConfig: TokenConfig
  }): Promise<TokenBalance | null> {
    try {
      const balance = await publicClient.readContract({
        address: tokenConfig.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress]
      })

      return {
        symbol: tokenConfig.symbol,
        balance: formatBalance(balance, tokenConfig.decimals),
        address: tokenConfig.address
      }
    } catch (error) {
      console.error(`Error fetching ${tokenConfig.symbol} balance:`, error)

      return null
    }
  }

  const fetchFallbackBalances = React.useCallback(
    async (userAddress: Hex, chainIdAsHex: Hex): Promise<TokenBalance[]> => {
      const chainIdNum = parseInt(chainIdAsHex.slice(2), 16)
      const tokenBalances: TokenBalance[] = []

      try {
        const chain = getChain(chainIdNum)
        if (!chain) {
          throw new Error(`Chain not found for ID: ${chainIdNum}`)
        }
        const publicClient = createPublicClient({
          chain,
          transport: http()
        })

        // Fetch native token balance
        try {
          const nativeBalance = await publicClient.getBalance({
            address: userAddress
          })

          tokenBalances.push({
            symbol: chain.nativeCurrency.symbol,
            balance: formatBalance(nativeBalance, chain.nativeCurrency.decimals),
            address: '0x' as Hex
          })
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error fetching native balance:', error)
        }

        // Configure supported tokens for the chain
        const supportedTokens: TokenConfig[] = []

        // Add USDC if supported on this chain
        const usdcAddress = usdcTokenAddresses[chainIdNum]
        if (usdcAddress) {
          supportedTokens.push({
            symbol: 'USDC',
            decimals: 6,
            address: usdcAddress
          })
        }

        // Add USDT if supported on this chain
        const usdtAddress = usdtTokenAddresses[chainIdNum]
        if (usdtAddress) {
          supportedTokens.push({
            symbol: 'USDT',
            decimals: 6,
            address: usdtAddress
          })
        }

        // Fetch all token balances in parallel
        const tokenResults = await Promise.allSettled(
          supportedTokens.map(token =>
            fetchTokenBalance({ publicClient, userAddress, tokenConfig: token })
          )
        )

        // Filter out failed requests and null results
        tokenResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            tokenBalances.push(result.value)
          }
        })

        return tokenBalances
      } catch (error) {
        console.error('Error in fetchFallbackBalances:', error)

        // Return any balances we managed to fetch instead of empty array
        return tokenBalances
      }
    },
    []
  )

  const fetchBalances = React.useCallback(async () => {
    if (!address || status !== 'connected' || !chainId || !walletProvider) {
      return
    }
    const chainIdAsHex = convertChainIdToHex(parseInt(chainId.toString(), 10))
    const request: WalletGetAssetsRPCRequest = {
      account: address,
      chainFilter: [chainIdAsHex]
    }

    try {
      setIsLoading(true)

      // Check wallet capabilities first
      const capabilities = await getAssetDiscoveryCapabilities(
        walletProvider,
        chainIdAsHex,
        address
      )

      let assetsResponse: Record<Hex, Asset[]>[] = []

      if (capabilities.hasAssetDiscovery) {
        if (
          walletProviderType === 'WALLET_CONNECT' &&
          capabilities.hasWalletService &&
          capabilities.walletServiceUrl
        ) {
          // Use WalletService to fetch assets
          assetsResponse = await getAssetsViaWalletService(request, capabilities.walletServiceUrl)
        } else {
          // Fallback to direct provider call
          assetsResponse = await getAssetsViaProvider(walletProvider, request)
        }

        const assetsObject = assetsResponse.find(item => chainIdAsHex in item)
        if (assetsObject) {
          const chainAssets = assetsObject[chainIdAsHex]
          if (chainAssets && chainAssets.length > 0) {
            const tokenBalances = processAssetsToBalances(chainAssets)
            console.log('tokenBalances', tokenBalances)
            setBalances(tokenBalances)

            return
          }
        }
      }
      // If we get here, either asset discovery isn't supported or returned no results
      const fallbackBalances = await fetchFallbackBalances(address as `0x${string}`, chainIdAsHex)
      setBalances(fallbackBalances)
    } catch (error) {
      console.error(
        `Error fetching assets: ${error instanceof Error ? error.message : String(error)}`
      )
      setBalances([])
    } finally {
      setIsLoading(false)
    }
  }, [
    address,
    status,
    chainId,
    walletProvider,
    getAssetDiscoveryCapabilities,
    fetchFallbackBalances,
    walletProviderType,
    getAssetsViaWalletService,
    getAssetsViaProvider,
    processAssetsToBalances
  ])

  const getBalanceBySymbol = React.useCallback(
    (symbol: string) => balances.find(b => b.symbol === symbol)?.balance || '0.00',
    [balances]
  )

  const getBalanceByAddress = React.useCallback(
    (tokenAddress: Hex) => balances.find(b => b.address === tokenAddress)?.balance || '0.00',
    [balances]
  )

  React.useEffect(() => {
    fetchBalances()
  }, [address, fetchBalances])

  const value = React.useMemo(
    () => ({
      balances,
      isLoading,
      refetch: fetchBalances,
      getBalanceBySymbol,
      getBalanceByAddress
    }),
    [balances, isLoading, fetchBalances, getBalanceBySymbol, getBalanceByAddress]
  )

  return <WalletAssetsContext.Provider value={value}>{children}</WalletAssetsContext.Provider>
}

export function useWalletGetAssets() {
  const context = React.useContext(WalletAssetsContext)
  if (context === undefined) {
    throw new Error('useWalletGetAssets must be used within a WalletGetAssetsProvider')
  }

  return context
}
