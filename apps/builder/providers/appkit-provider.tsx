'use client'

import React, { type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi'

import { ConstantsUtil } from '@reown/appkit-core'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { networks, wagmiAdapter } from '@/lib/config'
import { ThemeStore } from '@/lib/theme-store'
import { urlStateUtils } from '@/lib/url-state'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const metadata = {
  name: 'AppKit Builder',
  description: 'The full stack toolkit to build onchain app UX',
  url: window?.origin || 'https://demo.reown.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const initialConfig = urlStateUtils.getStateFromURL()

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: mainnet,
  metadata: metadata,
  features: initialConfig?.features || ConstantsUtil.DEFAULT_FEATURES,
  enableWallets: initialConfig?.enableWallets || true,
  themeMode: initialConfig?.themeMode || 'dark',
  themeVariables: initialConfig?.themeVariables || {},
  termsConditionsUrl: initialConfig?.termsConditionsUrl || '',
  privacyPolicyUrl: initialConfig?.privacyPolicyUrl || '',
  disableAppend: true
})

ThemeStore.setModal(modal)
ThemeStore.initializeThemeVariables(initialConfig?.themeVariables || {})

export function AppKitProvider({
  children,
  cookies
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
