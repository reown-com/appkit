'use client'

import Connect from '@/components/Connect'
import styles from './page.module.css'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

export default function Home() {
  const network = useAppKitNetwork()
  const account = useAppKitAccount()

  return (
    <main className={styles['main']}>
      <Connect />
      <appkit-network-button />
      <p>{JSON.stringify(network, null, 2)}</p>
      <p>{JSON.stringify(account, null, 2)}</p>
    </main>
  )
}
