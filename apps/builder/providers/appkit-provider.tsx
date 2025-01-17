'use client'

import React, { type ReactNode } from 'react'

import { ref } from 'valtio/vanilla'

import { createAppKit } from '@reown/appkit/react'

import { appKitConfigs, initialConfig } from '@/lib/config'
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
