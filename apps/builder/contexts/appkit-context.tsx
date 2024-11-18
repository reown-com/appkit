'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { ThemeVariables, Features, ThemeMode } from '@reown/appkit-core'

interface AppKitContextType {
  themeMode: ThemeMode
  themeVariables: ThemeVariables
  features: Features
  isLoading: boolean
  isDrawerOpen: boolean
  termsConditionsUrl: string
  privacyPolicyUrl: string
  socialsEnabled: boolean
  setIsDrawerOpen: (open: boolean) => void
  updateThemeMode: (mode: ThemeMode) => void
  updateThemeVariables: (variables: Partial<ThemeVariables>) => void
  updateFeatures: (features: Partial<Features>) => void
  updateSocials: (enabled: boolean) => void
  updateUrls: (urls: { termsConditions?: string; privacyPolicy?: string }) => void
}

export const AppKitContext = createContext<AppKitContextType | undefined>(undefined)
