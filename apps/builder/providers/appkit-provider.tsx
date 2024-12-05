'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createAppKit, Features, ThemeMode, ThemeVariables, type AppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type AppKitNetwork, mainnet, polygon } from '@reown/appkit/networks'
import { ConnectMethod, ConstantsUtil, WalletFeature } from '@reown/appkit-core'
import { ThemeStore } from '../lib/theme-store'
import { URLState, urlStateUtils } from '@/lib/url-state'
import { AppKitContext } from '@/contexts/appkit-context'
import { useSnapshot } from 'valtio'
import { defaultCustomizationConfig } from '@/lib/config'
import { UniqueIdentifier } from '@dnd-kit/core'

const networks = [mainnet, polygon] as [AppKitNetwork, ...AppKitNetwork[]]

const ethersAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter({})

interface AppKitProviderProps {
  children: ReactNode
}

let kit: undefined | AppKit = undefined

interface AppKitProviderProps {
  children: ReactNode
  initialConfig?: URLState | null
}

const defaultConnectMethodOrder = ['email', 'social', 'wallet'] as ConnectMethod[]
const defaultWalletFeatureOrder = ['swaps', 'send', 'receive', 'onramp'] as WalletFeature[]

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  const initialConfig = urlStateUtils.getStateFromURL()

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
  const [enableWallets, setEnableWallets] = useState<boolean>(initialConfig?.enableWallets || true)
  const [isDraggingByKey, setIsDraggingByKey] = useState<Record<string, boolean>>({})
  const themeStore = useSnapshot(ThemeStore.state)

  function updateDraggingState(key: UniqueIdentifier, value: boolean) {
    setIsDraggingByKey(prev => ({
      ...prev,
      [key]: value
    }))
  }

  function updateFeatures(newFeatures: Partial<Features>) {
    setFeatures(prev => {
      const newValue = { ...prev, ...newFeatures }
      kit?.updateFeatures(newValue)
      urlStateUtils.updateURLWithState({ features: newValue })
      return newValue
    })
  }

  function updateEnableWallets(enabled: boolean) {
    setEnableWallets(() => {
      kit?.updateOptions({ enableWallets: enabled })
      urlStateUtils.updateURLWithState({ enableWallets: enabled })
      return enabled
    })
  }

  function updateThemeMode(mode: ThemeMode) {
    setThemeMode(() => {
      kit?.setThemeMode(mode)
      urlStateUtils.updateURLWithState({ themeMode: mode })
      return mode
    })
  }

  function updateUrls(urls: { termsConditions?: string; privacyPolicy?: string }) {
    if (urls.termsConditions !== undefined) {
      setTermsConditionsUrl(urls.termsConditions)
      kit?.setTermsConditionsUrl(urls.termsConditions)
      urlStateUtils.updateURLWithState({ termsConditionsUrl: urls.termsConditions })
    }
    if (urls.privacyPolicy !== undefined) {
      setPrivacyPolicyUrl(urls.privacyPolicy)
      kit?.setPrivacyPolicyUrl(urls.privacyPolicy)
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
    ThemeStore.setBorderRadius(variables['--w3m-border-radius-master'] || '')
    ThemeStore.setFontFamily(variables['--w3m-font-family'] || '')
  }

  function initializeThemeStore(modal: AppKit, variables: ThemeVariables) {
    ThemeStore.setModal({
      setThemeVariables: (variables: ThemeVariables) => {
        kit?.setThemeVariables(variables)
      }
    })
    ThemeStore.state.accentColor = variables['--w3m-accent'] || ''
    ThemeStore.state.mixColor = variables['--w3m-color-mix'] || ''
    ThemeStore.state.mixColorStrength = variables['--w3m-color-mix-strength'] || 0
    ThemeStore.state.borderRadius = variables['--w3m-border-radius-master'] || ''
    ThemeStore.state.fontFamily = variables['--w3m-font-family'] || ''
  }

  function resetConfigs() {
    setFeatures(ConstantsUtil.DEFAULT_FEATURES)
    setThemeStoreVariables({})
    setThemeMode('dark')
    setTermsConditionsUrl('')
    setPrivacyPolicyUrl('')
    setEnableWallets(true)
  }

  useEffect(() => {
    const config = (initialConfig as URLState | null) || defaultCustomizationConfig

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
      },
      privacyPolicyUrl: config.privacyPolicyUrl,
      termsConditionsUrl: config.termsConditionsUrl
    })

    initializeThemeStore(kit, config.themeVariables || {})
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
        updateFeatures,
        updateThemeMode,
        updateSocials,
        updateUrls,
        updateEnableWallets,
        setEnableWallets: updateEnableWallets,
        setSocialsOrder: kit?.setSocialsOrder,
        updateDraggingState,
        resetConfigs
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}
