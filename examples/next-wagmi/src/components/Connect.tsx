'use client'

import { useWeb3Modal } from '@web3modal/wagmi/react'

export default function Connect() {
  const { open } = useWeb3Modal()
  return <button onClick={() => open()}>Connect</button>
}
