'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Features, ThemeMode, ThemeVariables, type AppKit } from '@reown/appkit/react'
import { ConnectMethod, ConstantsUtil } from '@reown/appkit-core'
import { ThemeStore } from '../lib/theme-store'
import { URLState, urlStateUtils } from '@/lib/url-state'
import { AppKitContext } from '@/contexts/appkit-context'
import { useSnapshot } from 'valtio'
import { UniqueIdentifier } from '@dnd-kit/core'
import { defaultCustomizationConfig } from '@/lib/config'
import { useTheme } from 'next-themes'

interface AppKitProviderProps {
  children: ReactNode
}

interface AppKitProviderProps {
  children: ReactNode
  initialConfig?: URLState | null
}

const initialConfig = urlStateUtils.getStateFromURL()

export const ContextProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [features, setFeatures] = useState<Features>(
    initialConfig?.features || ConstantsUtil.DEFAULT_FEATURES
  )
  const { theme, setTheme } = useTheme()
  const [termsConditionsUrl, setTermsConditionsUrl] = useState(
    initialConfig?.termsConditionsUrl || ''
  )
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(initialConfig?.privacyPolicyUrl || '')
  const [enableWallets, setEnableWallets] = useState<boolean>(
    Boolean(initialConfig?.enableWallets) || true
  )
  const [isDraggingByKey, setIsDraggingByKey] = useState<Record<ConnectMethod, boolean>>({
    email: false,
    wallet: false,
    social: false
  })
  const themeStore = useSnapshot(ThemeStore.state)
  const appKit = themeStore.modal

  function updateDraggingState(key: UniqueIdentifier, value: boolean) {
    setIsDraggingByKey(prev => ({
      ...prev,
      [key]: value
    }))
  }

  function updateFeatures(newFeatures: Partial<Features>) {
    setFeatures(prev => {
      const newValue = { ...prev, ...newFeatures }
      appKit?.updateFeatures(newValue)
      urlStateUtils.updateURLWithState({ features: newValue })
      return newValue
    })
  }

  function updateEnableWallets(enabled: boolean) {
    setEnableWallets(() => {
      appKit?.updateOptions({ enableWallets: enabled })
      urlStateUtils.updateURLWithState({ enableWallets: enabled })
      return enabled
    })
  }

  function updateThemeMode(mode: ThemeMode) {
    setTheme(() => {
      appKit?.setThemeMode(mode)
      urlStateUtils.updateURLWithState({ themeMode: mode })
      return mode
    })
  }

  function updateUrls(urls: { termsConditions?: string; privacyPolicy?: string }) {
    if (urls.termsConditions !== undefined) {
      setTermsConditionsUrl(urls.termsConditions)
      appKit?.setTermsConditionsUrl(urls.termsConditions)
      urlStateUtils.updateURLWithState({ termsConditionsUrl: urls.termsConditions })
    }
    if (urls.privacyPolicy !== undefined) {
      setPrivacyPolicyUrl(urls.privacyPolicy)
      appKit?.setPrivacyPolicyUrl(urls.privacyPolicy)
      urlStateUtils.updateURLWithState({ privacyPolicyUrl: urls.privacyPolicy })
    }
  }

  function updateSocials(enabled: boolean) {
    if (enabled && !Array.isArray(features.socials)) {
      updateFeatures({ socials: ConstantsUtil.DEFAULT_FEATURES.socials })
    } else if (!enabled) {
      updateFeatures({ socials: false })
    }
  }

  function setThemeStoreVariables(variables: ThemeVariables) {
    ThemeStore.setAccentColor(variables['--w3m-accent'] || '')
    ThemeStore.setMixColor(variables['--w3m-color-mix'] || '')
    ThemeStore.setMixColorStrength(variables['--w3m-color-mix-strength'] || 0)
    ThemeStore.setBorderRadius(variables['--w3m-border-radius-master'] || '2px')
    ThemeStore.setFontFamily(variables['--w3m-font-family'] || '')
  }

  function resetConfigs() {
    updateEnableWallets(true)
    updateFeatures(ConstantsUtil.DEFAULT_FEATURES)
    updateUrls({
      privacyPolicy: defaultCustomizationConfig.privacyPolicyUrl,
      termsConditions: defaultCustomizationConfig.termsConditionsUrl
    })
    setThemeStoreVariables({})
    updateThemeMode(defaultCustomizationConfig.themeMode)
  }

  useEffect(() => {
    setTheme(theme as ThemeMode)
    setIsInitialized(true)
  }, [])

  const socialsEnabled = Array.isArray(features.socials)

  return (
    <AppKitContext.Provider
      value={{
        config: {
          features,
          enableWallets,
          themeMode: theme as ThemeMode,
          themeVariables: {
            '--w3m-color-mix': themeStore.mixColor,
            '--w3m-accent': themeStore.accentColor,
            '--w3m-color-mix-strength': themeStore.mixColorStrength,
            '--w3m-border-radius-master': themeStore.borderRadius,
            '--w3m-font-family': themeStore.fontFamily
          },
          termsConditionsUrl,
          privacyPolicyUrl
        },
        socialsEnabled,
        enableWallets,
        isDraggingByKey,
        isInitialized,
        updateFeatures,
        updateThemeMode,
        updateSocials,
        updateUrls,
        updateEnableWallets,
        setEnableWallets: updateEnableWallets,
        setSocialsOrder: appKit?.setSocialsOrder,
        updateDraggingState,
        resetConfigs
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}
