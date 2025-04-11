import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import Big from 'big.js'
import { Address, formatEther } from 'viem'
import { useBalance as useWagmiBalance } from 'wagmi'

import { ChainNamespace } from '@reown/appkit-common'

import { BitcoinProvider } from '../core/BitcoinProvider'

const bitcoinProvider = new BitcoinProvider()

export function useBalance(chain: ChainNamespace, account: string) {
  const { data: ethereumBalance } = useWagmiBalance({
    address: account as Address,
    query: {
      enabled: chain === 'eip155'
    }
  })

  const { data: solanaBalance = 0 } = useQuery({
    queryKey: ['balance', account],
    queryFn: async () => {
      const connection = new Connection(clusterApiUrl('mainnet-beta'))
      const wallet = new PublicKey(account)
      const balance = await connection.getBalance(wallet)

      // eslint-disable-next-line new-cap
      return Big(balance).div(LAMPORTS_PER_SOL).toNumber()
    },
    enabled: chain === 'solana'
  })

  function getBalance() {
    switch (chain) {
      case 'eip155':
        return formatEther(ethereumBalance?.value ?? BigInt(0))
      case 'solana':
        return solanaBalance.toString()
      case 'bip122':
        return bitcoinProvider.getBalance(account).toString()
      default:
        return '0'
    }
  }

  return getBalance()
}
