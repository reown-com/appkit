'use client'

import { useEffect } from 'react'

import { useAppKitSIWX } from '@reown/appkit-siwx/react'
import { useAppKitTheme } from '@reown/appkit/react'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import { useSession } from './components/SessionProvider'

export default function App() {
  const { themeMode } = useAppKitTheme()
  const siwx = useAppKitSIWX()
  const session = useSession()

  useEffect(() => {
    document.documentElement.className = themeMode
  }, [themeMode])

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

      <h1 className="page-title">React AppKit Reown Authentication Example</h1>

      <div className="appkit-buttons-container">
        <appkit-button />
        <appkit-network-button />
      </div>

      <ActionButtonList />

      <div className="code-container-wrapper">
        <section className="code-container">
          <h2 className="code-container-title">useAppKitSIWX()</h2>
          <div className="code-container-content">
            <pre>{JSON.stringify(siwx, null, 2)}</pre>
          </div>
        </section>

        <section className="code-container">
          <h2 className="code-container-title">Active Session</h2>
          <div className="code-container-content">
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
