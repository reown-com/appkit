'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createAppKit, Features, ThemeMode, ThemeVariables, type AppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type AppKitNetwork, mainnet, polygon } from '@reown/appkit/networks'
import { ConnectMethod, ConstantsUtil, WalletFeature } from '@reown/appkit-core'
import { ThemeStore } from '../lib/ThemeStore'
import { URLState } from '@/lib/url-state'
import { AppKitContext } from '@/contexts/appkit-context'
import { useSnapshot } from 'valtio'

const networks = [mainnet, polygon] as [AppKitNetwork, ...AppKitNetwork[]]

const ethersAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter({})

interface AppKitProviderProps {
  children: ReactNode
}

let kit: undefined | AppKit = undefined

interface AppKitProviderProps {
  children: ReactNode
  initialConfig: URLState | null
}

const defaultCustomizationConfig = {
  features: ConstantsUtil.DEFAULT_FEATURES,
  collapseWallets: false,
  enableWallets: true,
  themeMode: 'dark' as ThemeMode,
  themeVariables: {},
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  experimental_enableEmbedded: true
}

const defaultConnectMethodOrder = ['email', 'social', 'wallet'] as ConnectMethod[]
const defaultWalletFeatureOrder = ['swaps', 'send', 'receive', 'onramp'] as WalletFeature[]

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children, initialConfig }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [features, setFeatures] = useState<Features>(
    initialConfig?.features || ConstantsUtil.DEFAULT_FEATURES
  )
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialConfig?.themeMode || 'dark')
  const [termsConditionsUrl, setTermsConditionsUrl] = useState(
    initialConfig?.termsConditionsUrl || ''
  )
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(initialConfig?.privacyPolicyUrl || '')
  const [enableWallets, setEnableWallets] = useState(initialConfig?.enableWallets || true)
  const [isDraggingByKey, setIsDraggingByKey] = useState<Record<string, boolean>>({})
  const themeStore = useSnapshot(ThemeStore.state)

  function updateDraggingState(key: string, value: boolean) {
    setIsDraggingByKey(prev => ({
      ...prev,
      [key]: value
    }))
  }

  function updateFeatures(newFeatures: Partial<Features>) {
    setFeatures(prev => {
      const newValue = { ...prev, ...newFeatures }
      kit?.updateFeatures(newValue)
      return newValue
    })
  }

  function updateEnableWallets(enabled: boolean) {
    setEnableWallets(() => {
      kit?.updateOptions({ enableWallets: enabled })
      return enabled
    })
  }

  function updateThemeMode(mode: ThemeMode) {
    setThemeMode(() => {
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

  function initializeState(config: URLState | null) {
    if (!config) {
      return
    }

    // Theme configs
    console.log('>>> initializeState', config)
    if (Object.keys(config?.themeVariables || {}).length > 0) {
      ThemeStore.state.mixColor = config?.themeVariables?.['--w3m-color-mix'] || ''
      ThemeStore.state.accentColor = config?.themeVariables?.['--w3m-accent'] || ''
      ThemeStore.state.mixColorStrength = config?.themeVariables?.['--w3m-color-mix-strength'] || 8
      ThemeStore.state.borderRadius =
        config?.themeVariables?.['--w3m-border-radius-master'] || '4px'
      ThemeStore.state.fontFamily = config?.themeVariables?.['--w3m-font-family'] || ''
      ThemeStore.state.themeVariables = config?.themeVariables || {}
    }
  }

  function replaceConfig(config: URLState | null) {
    if (!config) {
      return
    }

    console.log('>>> replaceConfig', config)
    updateFeatures(config?.features || ConstantsUtil.DEFAULT_FEATURES)
    updateThemeMode(config?.themeMode || 'dark')
    updateEnableWallets(config?.enableWallets || true)

    // Theme configs
    ThemeStore.setMixColor(config?.themeVariables?.['--w3m-color-mix'] || '')
    ThemeStore.setAccentColor(config?.themeVariables?.['--w3m-accent'] || '')
    ThemeStore.setMixColorStrength(config?.themeVariables?.['--w3m-color-mix-strength'] || 8)
    ThemeStore.setBorderRadius(config?.themeVariables?.['--w3m-border-radius-master'] || '4px')
    ThemeStore.setFontFamily(config?.themeVariables?.['--w3m-font-family'] || '')
    ThemeStore.setThemeVariables(config?.themeVariables || {})
  }

  useEffect(() => {
    const config = (initialConfig as URLState | null) || defaultCustomizationConfig
    initializeState(config)

    const walletFeatureOrder =
      config?.features?.experimental_walletFeaturesOrder || defaultWalletFeatureOrder
    const connectMethodOrder =
      config?.features?.experimental_connectMethodOrder || defaultConnectMethodOrder
    const collapseWallets = config?.collapseWallets || false

    kit = createAppKit({
      adapters: [ethersAdapter, solanaAdapter],
      networks,
      defaultNetwork: mainnet,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
      disableAppend: true,
      ...config,
      features: {
        ...config?.features,
        experimental_walletFeaturesOrder: walletFeatureOrder,
        experimental_connectMethodOrder: connectMethodOrder,
        experimental_collapseWallets: collapseWallets
      }
    })

    ThemeStore.setModal({
      setThemeVariables: (variables: ThemeVariables) => {
        kit?.setThemeVariables(variables)
      }
    })

    setIsLoading(false)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    const connectMethodOrder = features.experimental_connectMethodOrder || defaultConnectMethodOrder
    const walletFeatureOrder =
      features.experimental_walletFeaturesOrder || defaultWalletFeatureOrder
    if (!isLoading) {
      kit?.setConnectMethodOrder(connectMethodOrder)
      kit?.setWalletFeatureOrder(walletFeatureOrder)
      kit?.setCollapseWallets(features.experimental_collapseWallets || false)
    }
  }, [isLoading, features])

  const socialsEnabled = Array.isArray(features.socials)

  return (
    <AppKitContext.Provider
      value={{
        config: {
          features,
          enableWallets,
          themeMode,
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
        isLoading,
        socialsEnabled,
        enableWallets,
        isDraggingByKey,
        isInitialized,
        replaceConfig,
        updateFeatures,
        updateThemeMode,
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
