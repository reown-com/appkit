'use client'

import { ActionButtonList } from '@/components/ActionButtonList'
import { InfoList } from '@/components/InfoList'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <div className="page-container">
      <div className="logo-container">
        <img src="/reown-logo.png" alt="Reown" width="150" />
        <img src="/appkit-logo.png" alt="Reown" width="150" />
      </div>

      <h1 className="page-title">Next.js App Router Solana Example</h1>

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
