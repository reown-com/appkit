'use client'

import React, { type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi'

import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { networks, projectId, wagmiAdapter } from '@/config'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
export const appKitMetadata = {
  name: 'AppKit Next.js Wagmi',
  description: 'AppKit Next.js App Router Wagmi Example',
  url: 'https://appkit-lab.reown.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: mainnet,
  metadata: appKitMetadata,
  themeMode: 'light',
  features: {
    analytics: true
  }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
