'use client'

import { createAppKit, useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { wagmiAdapter } from '../config'
import { mainnet, polygon, base } from '@reown/appkit/networks'
import styles from '../styles/Connect.module.css'

// Initialize AppKit
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon, base],
  projectId,
  metadata: {
    name: 'AppKit Next.js Example',
    description: 'AppKit Next.js Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

function CustomButton() {
  const { open } = useAppKit()
  const { status, address, caipAddress } = useAppKitAccount()

  const isPending = status === undefined || status === 'connecting' || status === 'reconnecting'

  if (isPending) {
    return <div>Loading</div>
  }

  return (
    <div style={{ padding: 16, background: 'gray', color: 'red' }} onClick={() => open()}>
      {caipAddress} {address}
    </div>
  )
}

export default function Connect() {
  const { status } = useAppKitAccount()
  const network = useAppKitNetwork()

  const isPending = status === undefined || status === 'connecting' || status === 'reconnecting'

  return (
    <div className={styles['container']}>
      <h1>Next.js Wagmi Example</h1>

      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div className={styles['buttonGroup']}>
          <w3m-button />
          <w3m-network-button />
        </div>
      )}

      {/* Modal Controls */}
      <div className={styles['buttonGroup']}>
        <CustomButton />
        <button onClick={() => modal.open({ view: 'Networks' })}>Open Network Modal</button>
        <button
          onClick={() => network.switchNetwork(network.chainId === polygon.id ? mainnet : polygon)}
        >
          Switch to {network.chainId === polygon.id ? 'Mainnet' : 'Polygon'}
        </button>
      </div>
    </div>
  )
}
