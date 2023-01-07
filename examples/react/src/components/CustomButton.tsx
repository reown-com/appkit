import { useWeb3Modal } from '@web3modal/react'
import { useState } from 'react'

export default function CustomButton() {
  const [loading, setLoading] = useState(false)
  const { open } = useWeb3Modal()

  async function onOpen() {
    setLoading(true)
    await open()
    setLoading(false)
  }

  return (
    <button onClick={onOpen} disabled={loading}>
      {loading ? 'Loading...' : 'Custom Button'}
    </button>
  )
}
