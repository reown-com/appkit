import { useWeb3Modal } from '@web3modal/react'
import { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

export default function CustomButton() {
  const [loading, setLoading] = useState(false)
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const label = isConnected ? 'Disconnect' : 'Connect Custom'

  async function onOpen() {
    setLoading(true)
    await open()
    setLoading(false)
  }

  function onClick() {
    if (isConnected) {
      disconnect()
    } else {
      onOpen()
    }
  }

  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? 'Loading...' : label}
    </button>
  )
}
