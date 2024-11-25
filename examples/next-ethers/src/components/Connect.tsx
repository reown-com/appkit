'use client'

import { useAppKitAccount } from '@reown/appkit/react'

export default function Connect() {
  const { status } = useAppKitAccount()

  console.log('>>> STATUS', status)

  const isPending = status === undefined

  if (isPending) {
    return <div>Loading...</div>
  }

  return <appkit-button />
}
