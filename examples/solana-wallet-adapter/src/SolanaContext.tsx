/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useMemo } from 'react'

import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css'
import { clusterApiUrl } from '@solana/web3.js'

import { WalletConnectWalletAdapter } from '@reown/appkit-solana-wallet-adapter'

const endpoint = clusterApiUrl(WalletAdapterNetwork.Mainnet)

export const SolanaContext = ({ children }: { children: ReactNode }) => {
  // Ensure projectId is loaded from env

  const wallets = [
    new WalletConnectWalletAdapter({
      network: WalletAdapterNetwork.Mainnet,
      options: {
        projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID as string
      }
    })
  ]

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
