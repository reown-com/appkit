import { useWeb3Modal, Web3Button, Web3Modal } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { ethereumClient } from './_app'

export default function CustomPage() {
  const { isConnected } = useAccount()
  const { open } = useWeb3Modal()

  return (
    <>
      {/* Use predefined button */}
      <Web3Button />

      {/* Use custom button */}
      {!isConnected && <button onClick={() => open()}>Or Use Custom Button</button>}

      <Web3Modal
        ethereumClient={ethereumClient}
        // Custom Chain Images
        chainImages={{
          1: '/images/chain_ethereum.webp',
          137: '/images/chain_polygon.webp',
          10: '/images/chain_optimism.webp',
          42161: '/images/chain_arbitrum.webp'
        }}
        // Custom Linking Mobile Wallets
        mobileWallets={[]}
        // Custom Linking Desktop Wallets
        desktopWallets={[
          {
            id: 'ledger',
            name: 'Ledger',
            links: { deep: 'ledgerlive://', universal: 'https://wallet.zerion.io' }
          },
          {
            id: 'zerion',
            name: 'Zerion',
            links: { deep: 'zerion://', universal: '' }
          }
        ]}
        // Custom Wallet Images
        walletImages={{
          metaMask: 'images/wallet_metamask.webp',
          brave: '/images/wallet_brave.webp',
          ledger: '/images/wallet_ledger.webp',
          coinbaseWallet: '/images/wallet_coinbase.webp',
          zerion: '/images/wallet_zerion.webp'
        }}
      />
    </>
  )
}
