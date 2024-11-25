'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useState } from 'react'
import { useEffect } from 'react'

function CustomButton() {
  const { open } = useAppKit()
  const { status, address, caipAddress, isConnected } = useAppKitAccount()

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
  const [rendered, setRendered] = useState(false)
  const { status } = useAppKitAccount()

  console.log('>>> status', status)

  const isPending = status === undefined || status === 'connecting' || status === 'reconnecting'

  // useEffect(() => {
  //   setRendered(true)
  // }, [])

  // if (!rendered) {
  //   return null
  // }

  if (isPending) {
    return <p>Loading...</p>
  }

  return <CustomButton />
}
