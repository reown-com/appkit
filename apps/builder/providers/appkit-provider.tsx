'use client'

import React, { type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ref } from 'valtio/vanilla'
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi'

import { ConstantsUtil } from '@reown/appkit-core'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { networks, wagmiAdapter } from '@/lib/config'
import { ThemeStore } from '@/lib/theme-store'

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
  return <>{children}</>
}
