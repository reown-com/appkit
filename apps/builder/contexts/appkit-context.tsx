'use client'

import React, { createContext } from 'react'
import type { ThemeVariables, Features, ThemeMode, SocialProvider } from '@reown/appkit-core'

interface AppKitContextType {
  themeMode: ThemeMode
  themeVariables: ThemeVariables
  features: Features
  enableWallets: boolean
  isLoading: boolean
  isDrawerOpen: boolean
  termsConditionsUrl: string
  privacyPolicyUrl: string
  socialsEnabled: boolean
  isDraggingByKey: Record<string, boolean>
  setIsDrawerOpen: (open: boolean) => void
  updateThemeMode: (mode: ThemeMode) => void
  updateThemeVariables: (variables: Partial<ThemeVariables>) => void
  updateFeatures: (features: Partial<Features>) => void
  updateSocials: (enabled: boolean) => void
  updateEnableWallets: (enabled: boolean) => void
  updateUrls: (urls: { termsConditions?: string; privacyPolicy?: string }) => void
  setEnableWallets: (enabled: boolean) => void
  setSocialsOrder: ((order: SocialProvider[]) => void) | undefined
  updateDraggingState: (key: string, dragging: boolean) => void
}

export const AppKitContext = createContext<AppKitContextType | undefined>(undefined)
