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
        // Custom Linking Mobile Wallets
        mobileWallets={[
          {
            id: 'trust',
            name: 'Trust Wallet',
            links: { native: 'trust://', universal: 'https://link.trustwallet.com' }
          },
          {
            id: 'rainbow',
            name: 'Rainbow',
            links: { native: 'rainbow://', universal: 'https://rainbow.me' }
          }
        ]}
        // Custom Linking Desktop Wallets
        desktopWallets={[
          {
            id: 'ledger',
            name: 'Ledger',
            links: { native: 'ledgerlive://', universal: 'https://www.ledger.com' }
          },
          {
            id: 'zerion',
            name: 'Zerion',
            links: { native: 'zerion://', universal: 'https://wallet.zerion.io' }
          },
          {
            id: 'tokenary',
            name: 'Tokenary',
            links: { native: 'tokenary://', universal: 'https://tokenary.io' }
          }
        ]}
        // Custom Wallet Images
        walletImages={{
          metaMask: '/images/wallet_metamask.webp',
          brave: '/images/wallet_brave.webp',
          ledger: '/images/wallet_ledger.webp',
          coinbaseWallet: '/images/wallet_coinbase.webp',
          zerion: '/images/wallet_zerion.webp',
          trust: '/images/wallet_trust.webp',
          rainbow: '/images/wallet_rainbow.webp'
        }}
        // Custom Chain Images
        chainImages={{
          137: '/images/chain_polygon.webp',
          10: '/images/chain_optimism.webp',
          42161: '/images/chain_arbitrum.webp'
        }}
      />
    </>
  )
}
