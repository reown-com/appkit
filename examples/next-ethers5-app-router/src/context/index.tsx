'use client'

import React, { type ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { createAppKit } from '@reown/appkit/react'
import { ethersAdapter, networks, projectId } from '@/config'

createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata: {
    name: 'AppKit Next.js Wagmi',
    description: 'AppKit Next.js App Router with Wagmi Adapter',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  themeMode: 'light',
  features: {
    analytics: true
  }
})

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}

export default ContextProvider
