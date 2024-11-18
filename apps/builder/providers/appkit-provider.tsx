'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createAppKit, Features, ThemeMode, ThemeVariables, type AppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type AppKitNetwork, mainnet, polygon } from '@reown/appkit/networks'
import { ThemeStore } from '../lib/ThemeStore'
import { getStateFromUrl, updateUrlState } from '@/lib/url-state'
import { AppKitContext } from '@/contexts/appkit-context'

const networks = [mainnet, polygon] as [AppKitNetwork, ...AppKitNetwork[]]

const ethersAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter({})

interface AppKitProviderProps {
  children: ReactNode
}

let kit: undefined | AppKit = undefined

interface AppKitProviderProps {
  children: ReactNode
}

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [features, setFeatures] = useState<Features>({})
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [themeVariables, setThemeVariables] = useState<ThemeVariables>({})
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [termsConditionsUrl, setTermsConditionsUrl] = useState('')
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('')

  // Initialize AppKit and state from URL
  useEffect(() => {
    const urlState = getStateFromUrl()
    setFeatures(urlState.features)
    setThemeMode(urlState.themeMode)

    kit = createAppKit({
      adapters: [ethersAdapter, solanaAdapter],
      networks,
      defaultNetwork: mainnet,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
      disableAppend: true,
      features: urlState.features,
      themeMode: urlState.themeMode,
      termsConditionsUrl,
      privacyPolicyUrl
    })

    ThemeStore.setModal({
      setThemeVariables: (variables: ThemeVariables) => {
        kit?.setThemeVariables(variables)
      }
    })

    setIsLoading(false)
  }, [])

  // Update URL when state changes
  useEffect(() => {
    if (!isLoading) {
      updateUrlState(features, themeMode)
    }
  }, [features, themeMode, isLoading])

  // Update AppKit when core states change
  useEffect(() => {
    if (!isLoading) {
      kit?.setThemeMode(themeMode)
      kit?.updateFeatures(features)
    }
  }, [themeMode, features, isLoading])

  const updateFeatures = (newFeatures: Partial<Features>) => {
    setFeatures(prev => ({ ...prev, ...newFeatures }))
  }

  const updateThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode)
    kit?.setThemeMode(mode)
  }

  const updateUrls = (urls: { termsConditions?: string; privacyPolicy?: string }) => {
    if (urls.termsConditions !== undefined) {
      setTermsConditionsUrl(urls.termsConditions)
      kit?.setTermsConditionsUrl(urls.termsConditions)
    }
    if (urls.privacyPolicy !== undefined) {
      setPrivacyPolicyUrl(urls.privacyPolicy)
      kit?.setPrivacyPolicyUrl(urls.privacyPolicy)
    }
  }

  const updateSocials = (enabled: boolean) => {
    if (enabled && !Array.isArray(features.socials)) {
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
        themeMode,
        themeVariables,
        isLoading,
        isDrawerOpen,
        termsConditionsUrl,
        privacyPolicyUrl,
        socialsEnabled,
        setIsDrawerOpen,
        updateFeatures,
        updateThemeMode,
        updateThemeVariables: setThemeVariables,
        updateSocials,
        updateUrls
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}
