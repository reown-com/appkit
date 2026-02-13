'use client'

import { useTheme } from 'next-themes'

import { tronShastaTestnet } from '@reown/appkit/networks'

import { useAppKit, useAppKitNetwork, useAppKitTheme, useDisconnect } from '@/config'

export function ActionButtonList() {
  const modal = useAppKit()
  const { disconnect } = useDisconnect()
  const { switchNetwork } = useAppKitNetwork()
  const { themeMode, setThemeMode } = useAppKitTheme()
  const { setTheme } = useTheme()

  function openAppKit() {
    modal.open()
  }

  function switchToNetwork() {
    switchNetwork(tronShastaTestnet)
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
    setTheme(newTheme)
  }

  return (
    <div className="action-button-list">
      <button onClick={openAppKit}>Open</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      <button onClick={switchToNetwork}>Switch to TRON Shasta</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
