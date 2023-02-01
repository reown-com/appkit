import { Web3Button, Web3Modal } from '@web3modal/react'
import CustomButton from '../components/CustomButton'
import ThemeControls from '../components/ThemeControls'
import { ethereumClient, projectId } from './_app'

export default function CustomPage() {
  return (
    <>
      <h2>Buttons</h2>
      <div className="container">
        {/* Use predefined button */}
        <Web3Button />

        {/* Use custom button */}
        <CustomButton />
      </div>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        // Custom Linking Mobile Wallets
        mobileWallets={[
          {
            id: 'oreid',
            name: 'OREID',
            links: {
              native: '',
              universal: 'https://www.oreid.io/'
            }
          }
        ]}
        // Custom Linking Desktop Wallets
        desktopWallets={[
          {
            id: 'oreid',
            name: 'OREID',
            links: {
              native: '',
              universal: 'https://www.oreid.io/'
            }
          }
        ]}
        // Custom Wallet Images
        walletImages={{
          oreid: '/images/wallet_oreid.svg'
        }}
        // Custom Chain Images
        chainImages={{
          137: '/images/chain_polygon.webp',
          10: '/images/chain_optimism.webp',
          42161: '/images/chain_arbitrum.webp'
        }}
      />

      <ThemeControls />
    </>
  )
}
