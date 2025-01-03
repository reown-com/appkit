'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { wagmiConfig, appKitConfigs, initialConfig } from '@/lib/config'
import { ThemeStore } from '@/lib/theme-store'
import { ref } from 'valtio/vanilla'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const modal = createAppKit(appKitConfigs)

ThemeStore.setModal(ref(modal))
ThemeStore.initializeThemeVariables(initialConfig?.themeVariables || {})

type AppKitProviderProps = {
  children: ReactNode
  cookies: string | null
}

export function AppKitProvider({ children, cookies }: AppKitProviderProps) {
  const initialState = cookieToInitialState(wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
