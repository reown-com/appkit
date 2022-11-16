import { useWeb3Modal, Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'

export default function HomePage() {
  const { isConnected } = useAccount()
  const { open } = useWeb3Modal()

  return (
    <>
      <Web3Button />
      <p>--- or ---</p>
      {!isConnected && <button onClick={() => open()}>Custom Button</button>}
    </>
  )
}
