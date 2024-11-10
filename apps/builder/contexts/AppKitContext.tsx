'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { ThemeVariables, Features, ThemeMode } from '@reown/appkit-core'
import { getStateFromUrl, updateUrlState } from '@/lib/url-state'

interface AppKitContextType {
  themeMode: ThemeMode
  themeVariables: ThemeVariables
  features: Features
  isLoading: boolean
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  updateThemeMode: (mode: ThemeMode) => void
  updateThemeVariables: (variables: Partial<ThemeVariables>) => void
  updateFeatures: (features: Partial<Features>) => void
  socialsEnabled: boolean
  updateSocials: (enabled: boolean) => void
}

const AppKitContext = createContext<AppKitContextType | undefined>(undefined)

export const useAppKit = () => {
  const context = useContext(AppKitContext)
  if (!context) {
    throw new Error('useAppKit must be used within an AppKitProvider')
  }
  return context
}

interface AppKitProviderProps {
  children: ReactNode
}

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [features, setFeatures] = useState<Features>({})
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [themeVariables, setThemeVariables] = useState<ThemeVariables>({})
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Initialize state from URL
  useEffect(() => {
    const urlState = getStateFromUrl()
    setFeatures(urlState.features)
    setThemeMode(urlState.themeMode)
    setIsLoading(false)
  }, [])

  // Update URL when state changes
  useEffect(() => {
    if (!isLoading) {
      updateUrlState(features, themeMode)
    }
  }, [features, themeMode, isLoading])

  const updateFeatures = (newFeatures: Partial<typeof features>) => {
    setFeatures(prev => ({ ...prev, ...newFeatures }))
  }

  const updateThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  // Update this function to set initial social options
  const updateSocials = (enabled: boolean) => {
    if (enabled && !Array.isArray(features.socials)) {
      // Set initial social options when enabling
      updateFeatures({
        socials: ['apple', 'google', 'x', 'github', 'farcaster', 'discord', 'facebook']
      })
    } else if (!enabled) {
      updateFeatures({ socials: false })
    }
  }

  const socialsEnabled = Array.isArray(features.socials)

  return (
    <AppKitContext.Provider
      value={{
        features,
        updateFeatures,
        themeMode,
        updateThemeMode,
        themeVariables,
        updateThemeVariables: setThemeVariables,
        isLoading,
        isDrawerOpen,
        setIsDrawerOpen,
        socialsEnabled,
        updateSocials
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}
