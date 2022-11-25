import { useWeb3Modal, Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import ThemeControls from '../components/ThemeControls'

export default function HomePage() {
  const { isConnected } = useAccount()
  const { open } = useWeb3Modal()

  return (
    <>
      <div className="container">
        {/* Use predefined button */}
        <Web3Button />

        {/* Alternatively Use custom button */}
        {!isConnected && <button onClick={() => open()}>Custom</button>}
      </div>

      <ThemeControls />
    </>
  )
}
