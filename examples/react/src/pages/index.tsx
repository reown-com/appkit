import { ConnectButton } from '@web3modal/react'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setInterval(() => setCount(prev => prev + 1), 1000)
  }, [])

  return <ConnectButton label={`Count ${count}`} />
}
