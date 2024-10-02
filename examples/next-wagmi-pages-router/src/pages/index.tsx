import React from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import Link from 'next/link'

export default function Home() {
  const { address } = useAppKitAccount()
  const { open } = useAppKit()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        height: '100vh'
      }}
    >
      <span>Address: {address}</span>
      <button onClick={() => open()}>Open AppKit</button>

      <Link href="/page2">
        <div>Page 2</div>
      </Link>

      <w3m-button />
    </div>
  )
}
