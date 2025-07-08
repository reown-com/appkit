'use client'

import { useAppKitTheme } from '@reown/appkit/react'

import { ActionButtonList } from '@/components/ActionButtonList'
import { Footer } from '@/components/Footer'
import { InfoList } from '@/components/InfoList'

export default function Home() {
  const { themeMode } = useAppKitTheme()

  return (
    <div className="page-container">
      <div className="logo-container">
        <img
          src={themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'}
          alt="Reown"
          width="150"
        />
        <img src="/appkit-logo.png" alt="Reown" width="150" />
      </div>

      <h1 className="page-title">Next.js App Router AppKit Core Example</h1>

      <div className="appkit-buttons-container">
        <appkit-button />
        <appkit-network-button />
      </div>

      <ActionButtonList />
      <InfoList />
      <Footer />
    </div>
  )
}
