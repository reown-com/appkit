'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { useEffect, useState } from 'react'

export default function Connect() {
  const [rendered, setRendered] = useState(false)
  const { status } = useAppKitAccount()

  console.log('>>> status', status)

  const isPending = status === undefined || status === 'connecting' || status === 'reconnecting'

  useEffect(() => {
    setRendered(true)
  }, [])

  if (!rendered) {
    return null
  }

  if (isPending) {
    return <p>Loading...</p>
  }

  return <appkit-button />
}
