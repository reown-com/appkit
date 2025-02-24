import * as React from 'react'

import UniversalProvider from '@walletconnect/universal-provider'
import { type Hex } from 'viem'

import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import type { GetCapabilitiesResult } from '../types/EIP5792'
import type { Asset, WalletGetAssetsRPCRequest, WalletGetAssetsRPCResponse } from '../types/ERC7811'
import { fetchFallbackBalances } from '../utils/BalanceFetcherUtil'
import { convertChainIdToHex, formatBalance } from '../utils/FormatterUtil'

export interface TokenBalance {
  symbol: string
  balance: string
  address: Hex
  chainId: number
}

async function getAssetDiscoveryCapabilities({
  provider,
  chainIdAsHex,
  userAddress,
  walletProviderType
}: {
  provider: UniversalProvider
  chainIdAsHex: Hex
  userAddress: string
  walletProviderType: string
}): Promise<{
  hasAssetDiscovery: boolean
  hasWalletService: boolean
  walletServiceUrl?: string
}> {
  try {
    // For WalletConnect, also check CAIP-25
    if (walletProviderType === 'WALLET_CONNECT') {
      const sessionCapabilities = JSON.parse(
        provider.session?.sessionProperties?.['capabilities'] || '{}'
      )
      const hasAssetDiscovery =
        sessionCapabilities[chainIdAsHex]?.assetDiscovery?.supported ?? false
      const walletServiceUrl: string =
        sessionCapabilities[chainIdAsHex]?.['walletService']?.['wallet_getAssets']

      return {
        hasAssetDiscovery,
        hasWalletService: Boolean(walletServiceUrl),
        walletServiceUrl
      }
    }

    const capabilities: GetCapabilitiesResult = await provider.request({
      method: 'wallet_getCapabilities',
      params: [userAddress]
    })

    const hasAssetDiscovery = capabilities[chainIdAsHex]?.assetDiscovery?.supported ?? false

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
}

function processAssetsToBalances(chainAssets: Asset[], chainIdNum: number): TokenBalance[] {
  return chainAssets.map(asset => ({
    symbol: asset.metadata.symbol,
    balance: formatBalance(BigInt(asset.balance), asset.metadata.decimals),
    address: asset.address as Hex,
    chainId: chainIdNum
  }))
}

async function getAssetsViaWalletService(
  request: WalletGetAssetsRPCRequest,
  walletServiceUrl: string
): Promise<Record<Hex, Asset[]>[]> {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }

  const rpcRequest = {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000000),
    method: 'wallet_getAssets',
    params: [request]
  }

  const url = new URL(walletServiceUrl)
  url.searchParams.set('projectId', projectId)

  const response = await fetch(url.toString(), {
    body: JSON.stringify(rpcRequest),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })

  const { result } = (await response.json()) as WalletGetAssetsRPCResponse

  return result
}

async function getAssetsViaProvider(
  provider: UniversalProvider,
  request: WalletGetAssetsRPCRequest
): Promise<Record<Hex, Asset[]>[]> {
  const response: Record<Hex, Asset[]> = await provider.request({
    method: 'wallet_getAssets',
    params: [request]
  })

  return [response]
}

export function useWalletGetAssets() {
  const { address, status } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { walletProvider, walletProviderType } = useAppKitProvider<UniversalProvider>('eip155')

  const fetchBalances = React.useCallback(async (): Promise<TokenBalance[]> => {
    if (!address || status !== 'connected' || !chainId || !walletProvider || !walletProviderType) {
      return []
    }
    const chainIdAsHex = convertChainIdToHex(parseInt(chainId.toString(), 10))
    const request: WalletGetAssetsRPCRequest = {
      account: address,
      chainFilter: [chainIdAsHex]
    }

    try {
      // Check wallet capabilities first
      const capabilities = await getAssetDiscoveryCapabilities({
        provider: walletProvider,
        chainIdAsHex,
        userAddress: address,
        walletProviderType
      })

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
            return processAssetsToBalances(chainAssets, parseInt(chainIdAsHex.slice(2), 16))
          }
        }
      }

      // If we get here, either asset discovery isn't supported or returned no results
      return await fetchFallbackBalances(address as `0x${string}`, chainIdAsHex)
    } catch (error) {
      throw new Error(
        `Error fetching assets: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }, [
    address,
    status,
    chainId,
    walletProvider,
    getAssetDiscoveryCapabilities,
    walletProviderType,
    getAssetsViaWalletService,
    getAssetsViaProvider,
    processAssetsToBalances
  ])

  return {
    fetchBalances
  }
}
