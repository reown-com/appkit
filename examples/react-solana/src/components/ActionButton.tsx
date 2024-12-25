import { useAppKitState, useDisconnect, useAppKitNetwork, useAppKitTheme } from '../config'
import { mainnet } from '@reown/appkit/networks'

export function ActionButtonList() {
  const { disconnect } = useDisconnect()
  const { switchNetwork } = useAppKitNetwork()
  const { themeMode, setThemeMode } = useAppKitTheme()

  function openAppKit() {
    // modal.open()
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

  function toggleTheme() {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark'
    setThemeMode(newTheme)
    document.body.className = newTheme
  }

  return (
    <div className="action-button-list">
      <button onClick={openAppKit}>Open</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      <button onClick={switchToNetwork}>Switch to Ethereum</button>
      <button onClick={toggleTheme}>
        {themeMode === 'light' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M15 5V2C15 1.73478 15.1054 1.48043 15.2929 1.29289C15.4804 1.10536 15.7348 1 16 1C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V5C17 5.26522 16.8946 5.51957 16.7071 5.70711C16.5196 5.89464 16.2652 6 16 6C15.7348 6 15.4804 5.89464 15.2929 5.70711C15.1054 5.51957 15 5.26522 15 5ZM24 16C24 17.5823 23.5308 19.129 22.6518 20.4446C21.7727 21.7602 20.5233 22.7855 19.0615 23.391C17.5997 23.9965 15.9911 24.155 14.4393 23.8463C12.8874 23.5376 11.462 22.7757 10.3431 21.6569C9.22433 20.538 8.4624 19.1126 8.15372 17.5607C7.84504 16.0089 8.00346 14.4003 8.60896 12.9385C9.21447 11.4767 10.2398 10.2273 11.5554 9.34824C12.871 8.46919 14.4177 8 16 8C18.121 8.00232 20.1545 8.84591 21.6543 10.3457C23.1541 11.8455 23.9977 13.879 24 16Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M29.1925 17.7788C29.0642 17.6503 28.9034 17.5591 28.7272 17.515C28.551 17.471 28.3662 17.4757 28.1925 17.5288C26.2857 18.1053 24.2583 18.1536 22.3262 17.6686C20.3941 17.1837 18.6298 16.1837 17.2212 14.7751C15.8126 13.3665 14.8126 11.6022 14.3277 9.67013C13.8427 7.73804 13.8911 5.71059 14.4675 3.8038C14.521 3.63006 14.5261 3.44501 14.4823 3.26857C14.4385 3.09213 14.3475 2.93097 14.2189 2.80241C14.0904 2.67386 13.9292 2.58279 13.7528 2.53898C13.5763 2.49518 13.3913 2.5003 13.2175 2.5538C10.5813 3.36136 8.26695 4.97979 6.60378 7.1788C5.14929 9.10987 4.26209 11.4083 4.04186 13.8158"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  )
}

export default ActionButtonList
