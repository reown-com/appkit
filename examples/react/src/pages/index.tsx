import { useWeb3Modal, Web3Button, Web3NetworkSwitch } from '@web3modal/react'
import { useAccount } from 'wagmi'
import ThemeControls from '../components/ThemeControls'

export default function HomePage() {
  const { isConnected } = useAccount()
  const { open } = useWeb3Modal()

  return (
    <>
      <h2>Buttons</h2>
      <div className="container">
        {/* Use predefined button */}
        <Web3Button />
        <Web3Button balance="show" icon="hide" label="No Icon" />
        {!isConnected && <Web3Button label="Custom Label" />}

        {/* Alternatively Use custom button */}
        <button onClick={() => open()}>Custom Button</button>

        <Web3NetworkSwitch />
      </div>

      <ThemeControls />
    </>
  )
}
