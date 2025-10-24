import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { TonClient } from '@ton/ton'
import Big from 'big.js'
import { Address, formatEther } from 'viem'
import { useBalance as useWagmiBalance } from 'wagmi'

import { ChainNamespace } from '@reown/appkit-common'

export function useBalance(chain: ChainNamespace, account: string) {
  const { data: ethereumBalance } = useWagmiBalance({
    address: account as Address,
    query: {
      enabled: chain === 'eip155'
    }
  })

  const { data: solanaBalance = 0 } = useQuery({
    queryKey: ['solana-balance', account],
    queryFn: async () => {
      const connection = new Connection(clusterApiUrl('mainnet-beta'))
      const wallet = new PublicKey(account)
      const balance = await connection.getBalance(wallet)

      // eslint-disable-next-line new-cap
      return Big(balance).div(LAMPORTS_PER_SOL).toNumber()
    },
    enabled: chain === 'solana'
  })

  const { data: tonBalance = 0 } = useQuery({
    queryKey: ['ton-balance', account],
    queryFn: async () => {
      try {
        const client = new TonClient({
          endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'
        })
        const { Address } = await import('@ton/ton')
        const address = Address.parse(account)
        const balance = await client.getBalance(address)

        // TON uses 9 decimals
        // eslint-disable-next-line new-cap
        return Big(balance.toString()).div(1e9).toNumber()
      } catch {
        return 0
      }
    },
    enabled: chain === 'ton' && account !== ''
  })

  function getBalance() {
    switch (chain) {
      case 'eip155':
        return formatEther(ethereumBalance?.value ?? BigInt(0))
      case 'solana':
        return solanaBalance.toString()
      case 'bip122':
        return '0'
      case 'ton':
        return tonBalance.toString()
      default:
        return '0'
    }
  }

  return getBalance()
}
