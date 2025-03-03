/* eslint-disable no-console */
import { type Hex, type PublicClient, createPublicClient, erc20Abi, http } from 'viem'

import { usdcTokenAddresses, usdtTokenAddresses } from './CATokensUtil'
import { formatBalance } from './FormatterUtil'
import { getChain } from './NetworksUtil'

interface TokenConfig {
  symbol: string
  decimals: number
  address: Hex
}

export interface TokenBalance {
  symbol: string
  balance: string
  address: `0x${string}`
  chainId: number
}

// Helper function to fetch ERC20 token balance
async function fetchTokenBalance({
  publicClient,
  userAddress,
  tokenConfig,
  chainId
}: {
  publicClient: PublicClient
  userAddress: Hex
  tokenConfig: TokenConfig
  chainId: number
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
      address: tokenConfig.address,
      chainId
    }
  } catch (error) {
    console.error(`Error fetching ${tokenConfig.symbol} balance:`, error)

    return null
  }
}
function getTransport({ chainId }: { chainId: number }) {
  return http(
    `https://rpc.walletconnect.org/v1/?chainId=eip155:${chainId}&projectId=${process.env['NEXT_PUBLIC_PROJECT_ID']}`
  )
}
export async function fetchFallbackBalances(
  userAddress: Hex,
  currentChainIdAsHex: Hex
): Promise<TokenBalance[]> {
  const currentChainId = parseInt(currentChainIdAsHex.slice(2), 16)

  try {
    const chain = getChain(currentChainId)
    if (!chain) {
      console.error(`Chain not found for ID: ${currentChainId}`)

      return []
    }

    // Create public client for current chain
    const publicClient = createPublicClient({
      chain,
      transport: getTransport({ chainId: chain.id })
    })

    const balances: TokenBalance[] = []

    // Fetch native token balance
    try {
      const nativeBalance = await publicClient.getBalance({
        address: userAddress
      })

      balances.push({
        symbol: chain.nativeCurrency.symbol,
        balance: formatBalance(nativeBalance, chain.nativeCurrency.decimals),
        address: '0x' as Hex,
        chainId: currentChainId
      })
    } catch (error) {
      console.error(`Error fetching native balance:`, error)
    }

    // Get supported tokens for current chain
    const supportedTokens: TokenConfig[] = []

    // Add USDC if supported
    const usdcAddress = usdcTokenAddresses[currentChainId]
    if (usdcAddress) {
      supportedTokens.push({
        symbol: 'USDC',
        decimals: 6,
        address: usdcAddress
      })
    }

    // Add USDT if supported
    const usdtAddress = usdtTokenAddresses[currentChainId]
    if (usdtAddress) {
      supportedTokens.push({
        symbol: 'USDT',
        decimals: 6,
        address: usdtAddress
      })
    }

    // Fetch token balances
    const tokenResults = await Promise.all(
      supportedTokens.map(token =>
        fetchTokenBalance({
          publicClient,
          userAddress,
          tokenConfig: token,
          chainId: currentChainId
        })
      )
    )

    // Add successful token balances
    tokenResults.forEach(result => {
      if (result) {
        balances.push(result)
      }
    })

    return balances
  } catch (error) {
    console.error('Error in fetchFallbackBalances:', error)

    return []
  }
}
