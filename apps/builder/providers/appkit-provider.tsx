'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createAppKit, Features, ThemeMode, ThemeVariables, type AppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type AppKitNetwork, mainnet, polygon } from '@reown/appkit/networks'
import { ConnectMethod, ConstantsUtil, WalletFeature } from '@reown/appkit-core'
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

const defaultConnectMethodOrder = ['email', 'social', 'wallet'] as ConnectMethod[]
const defaultWalletFeatureOrder = ['swaps', 'send', 'receive', 'onramp'] as WalletFeature[]

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [features, setFeatures] = useState<Features>({})
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [themeVariables, setThemeVariables] = useState<ThemeVariables>({})
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [termsConditionsUrl, setTermsConditionsUrl] = useState('')
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('')
  const [enableWallets, setEnableWallets] = useState(true)
  const [isDraggingByKey, setIsDraggingByKey] = useState<Record<string, boolean>>({})

  function updateDraggingState(key: string, value: boolean) {
    setIsDraggingByKey(prev => ({
      ...prev,
      [key]: value
    }))
  }

  useEffect(() => {
    const urlState = getStateFromUrl()
    setFeatures(urlState.features)
    setThemeMode(urlState.themeMode)
    setEnableWallets(urlState.enableWallets)

    kit = createAppKit({
      adapters: [ethersAdapter, solanaAdapter],
      networks,
      defaultNetwork: mainnet,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
      disableAppend: true,
      features: {
        ...urlState.features,
        experimental_walletFeaturesOrder: urlState.walletFeatureOrder || defaultWalletFeatureOrder,
        experimental_connectMethodOrder: urlState.connectMethodOrder || defaultConnectMethodOrder,
        experimental_collapseWallets: urlState.collapseWallets || false
      },
      enableWallets: urlState.enableWallets,
      themeMode: urlState.themeMode,
      termsConditionsUrl,
      privacyPolicyUrl,
      experimental_enableEmbedded: true
    })

    ThemeStore.setModal({
      setThemeVariables: (variables: ThemeVariables) => {
        kit?.setThemeVariables(variables)
      }
    })

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      kit?.setConnectMethodOrder(
        features.experimental_connectMethodOrder || defaultConnectMethodOrder
      )
      kit?.setWalletFeatureOrder(
        features.experimental_walletFeaturesOrder || defaultWalletFeatureOrder
      )
      kit?.setCollapseWallets(features.experimental_collapseWallets || false)
    }
  }, [isLoading, features])

  function updateFeatures(newFeatures: Partial<Features>) {
    setFeatures(prev => {
      const newValue = { ...prev, ...newFeatures }
      kit?.updateFeatures(newValue)
      updateUrlState({ features: newValue })
      return newValue
    })
  }

  function updateEnableWallets(enabled: boolean) {
    setEnableWallets(() => {
      updateUrlState({ enableWallets: enabled })
      kit?.updateOptions({ enableWallets: enabled })
      return enabled
    })
  }

  function updateThemeMode(mode: ThemeMode) {
    setThemeMode(() => {
      updateUrlState({ themeMode: mode })
      kit?.setThemeMode(mode)
      return mode
    })
  }

  function updateUrls(urls: { termsConditions?: string; privacyPolicy?: string }) {
    if (urls.termsConditions !== undefined) {
      setTermsConditionsUrl(urls.termsConditions)
      kit?.setTermsConditionsUrl(urls.termsConditions)
    }
    if (urls.privacyPolicy !== undefined) {
      setPrivacyPolicyUrl(urls.privacyPolicy)
      kit?.setPrivacyPolicyUrl(urls.privacyPolicy)
    }
  }

  function updateSocials(enabled: boolean) {
    if (enabled && !Array.isArray(features.socials)) {
      updateFeatures({ socials: ConstantsUtil.DEFAULT_FEATURES.socials })
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
        enableWallets,
        isDraggingByKey,
        setIsDrawerOpen,
        updateFeatures,
        updateThemeMode,
        updateThemeVariables: setThemeVariables,
        updateSocials,
        updateUrls,
        updateEnableWallets,
        setEnableWallets: updateEnableWallets,
        setSocialsOrder: kit?.setSocialsOrder,
        updateDraggingState
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}
