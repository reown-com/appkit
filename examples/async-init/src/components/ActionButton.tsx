import { useAppKit, useDisconnect, useAppKitNetwork } from '@reown/appkit/react'
import { mainnet } from '@reown/appkit/networks'

export function ActionButtonList() {
  const modal = useAppKit()
  const { disconnect } = useDisconnect()
  const { switchNetwork } = useAppKitNetwork()

  function openAppKit() {
    modal.open()
  }

  function switchToNetwork() {
    switchNetwork(mainnet)
  }

  async function handleDisconnect() {
    try {
      await disconnect()
    } catch (error) {
      console.error('Error during disconnect:', error)
    }
  }

  return (
    <div className="action-button-list">
      <button onClick={openAppKit}>Open</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      <button onClick={switchToNetwork}>Switch to Ethereum</button>
    </div>
  )
}

export default ActionButtonList
