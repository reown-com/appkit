'use client'

import React, { type ReactNode } from 'react'

import { ThemeProvider } from 'next-themes'

import { AppKitNetwork, goerli, mainnet, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const networks = [mainnet, goerli, sepolia] as [AppKitNetwork, ...AppKitNetwork[]]

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
export const appKitMetadata = {
  name: 'AppKit Next.js AppKit Basic',
  description: 'AppKit Next.js AppKit Basic Example',
  url: 'https://appkit-lab.reown.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
export const modal = createAppKit({
  adapters: [],
  projectId,
  networks,

  metadata: appKitMetadata,
  themeMode: 'light',
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
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
