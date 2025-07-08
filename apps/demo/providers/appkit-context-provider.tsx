'use client'

import { type ReactNode, useEffect, useState } from 'react'

import { type UniqueIdentifier } from '@dnd-kit/core'
import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'
import { useSnapshot } from 'valtio'

import { type ChainNamespace } from '@reown/appkit-common'
import { type ConnectMethod, ConstantsUtil, type RemoteFeatures } from '@reown/appkit-controllers'
import {
  type Features,
  type ThemeMode,
  type ThemeVariables,
  useAppKitState
} from '@reown/appkit/react'

import { AppKitContext } from '@/contexts/appkit-context'
import { initialConfig, initialEnabledNetworks } from '@/lib/config'
import {
  NAMESPACE_NETWORK_IDS_MAP,
  NETWORK_ID_NAMESPACE_MAP,
  getNamespaceNetworks
} from '@/lib/constants'
import { defaultCustomizationConfig } from '@/lib/defaultConfig'
import { inter } from '@/lib/fonts'
import { type NetworkOption } from '@/lib/networks'
import { type URLState, urlStateUtils } from '@/lib/url-state'

import { ThemeStore } from '../lib/theme-store'

interface AppKitProviderProps {
  children: ReactNode
}

interface AppKitProviderProps {
  children: ReactNode
  initialConfig?: URLState | null
}

export function ContextProvider({ children }: AppKitProviderProps) {
  const { initialized: isInitialized } = useAppKitState()

  const [features, setFeatures] = useState<Features>(
    initialConfig?.features || ConstantsUtil.DEFAULT_FEATURES
  )

  const { theme, setTheme } = useTheme()
  const [termsConditionsUrl, setTermsConditionsUrl] = useState(
    initialConfig?.termsConditionsUrl || ''
  )
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(initialConfig?.privacyPolicyUrl || '')
  const [shouldEnableWallets, setShouldEnableWallets] = useState<boolean>(
    Boolean(initialConfig?.enableWallets) || true
  )
  const [isDraggingByKey, setIsDraggingByKey] = useState<Record<ConnectMethod, boolean>>({
    email: false,
    wallet: false,
    social: false
  })
  const [enabledChains, setEnabledChains] = useState<ChainNamespace[]>(
    initialConfig?.enabledChains || ['eip155', 'solana', 'bip122']
  )
  const [enabledNetworks, setEnabledNetworks] = useState<(string | number)[]>(
    initialEnabledNetworks || []
  )
  const themeStore = useSnapshot(ThemeStore.state)
  const appKit = themeStore.modal

  const [remoteFeatures, setRemoteFeatures] = useState<RemoteFeatures>(
    initialConfig?.remoteFeatures || ConstantsUtil.DEFAULT_REMOTE_FEATURES
  )

  function updateDraggingState(key: UniqueIdentifier, value: boolean) {
    setIsDraggingByKey(prev => ({
      ...prev,
      [key]: value
    }))
  }

  function getEnabledNetworksInNamespace(namespace: ChainNamespace) {
    return Array.from(
      new Set(
        enabledNetworks.filter(
          id => NETWORK_ID_NAMESPACE_MAP[id as keyof typeof NETWORK_ID_NAMESPACE_MAP] === namespace
        )
      )
    )
  }

  function disableChain(chain: ChainNamespace) {
    setEnabledChains(prev => {
      const newEnabledChains = prev.filter(c => c !== chain)
      urlStateUtils.updateURLWithState({ enabledChains: newEnabledChains })

      return newEnabledChains
    })

    // Remove all networks in the chain namespace before adding new ones
    NAMESPACE_NETWORK_IDS_MAP[chain].forEach(networkId => {
      appKit?.removeNetwork(chain, networkId)
    })

    // Update enabled networks state
    setEnabledNetworks(prev => {
      const newNetworks = prev.filter(n => !NAMESPACE_NETWORK_IDS_MAP[chain].includes(n))
      urlStateUtils.updateURLWithState({ enabledNetworks: newNetworks as string[] })

      return newNetworks
    })
  }

  function enableChain(chain: ChainNamespace) {
    setEnabledChains(prev => {
      const newEnabledChains = [...prev, chain]
      urlStateUtils.updateURLWithState({ enabledChains: newEnabledChains })

      return newEnabledChains
    })

    // Remove all networks in the chain namespace before adding new ones
    getNamespaceNetworks(chain).forEach(network => {
      appKit?.addNetwork(chain, network)
    })

    setEnabledNetworks(prev => {
      const newNetworks = [...prev, ...getNamespaceNetworks(chain).map(n => n.id)]
      urlStateUtils.updateURLWithState({ enabledNetworks: newNetworks as string[] })

      return newNetworks
    })
  }

  function removeNetwork(network: NetworkOption) {
    const enabledNetworksInNamespace = getEnabledNetworksInNamespace(network.namespace)

    if (enabledNetworksInNamespace.length === 1) {
      disableChain(network.namespace)
    } else {
      setEnabledNetworks(prev => {
        if (
          enabledNetworksInNamespace.length === 1 &&
          enabledNetworksInNamespace[0] === network.network.id
        ) {
          return prev
        }

        const newNetworks = prev.filter(n => n !== network.network.id)
        urlStateUtils.updateURLWithState({ enabledNetworks: newNetworks as string[] })

        return newNetworks
      })
      appKit?.removeNetwork(network.namespace, network.network.id)
    }
  }

  function addNetwork(network: NetworkOption) {
    const isChainEnabled = enabledChains.includes(network.namespace)

    if (!isChainEnabled) {
      // Enable the chain
      setEnabledChains(prev => {
        const newEnabledChains = [...prev, network.namespace]
        urlStateUtils.updateURLWithState({ enabledChains: newEnabledChains })

        return newEnabledChains
      })
    }

    setEnabledNetworks(prev => {
      const newEnabledNetworks = [...prev, network.network.id]
      urlStateUtils.updateURLWithState({ enabledNetworks: newEnabledNetworks as string[] })

      return newEnabledNetworks
    })

    appKit?.addNetwork(network.namespace, network.network)
  }

  function updateFeatures(newFeatures: Partial<Features>) {
    setFeatures(prev => {
      // Update the AppKit state first
      const newAppKitValue = { ...prev, ...newFeatures }
      appKit?.updateFeatures(newAppKitValue)

      // Get the connection methods order since it's calculated based on injected connectors dynamically
      const order =
        newFeatures?.connectMethodsOrder === undefined
          ? appKit?.getConnectMethodsOrder()
          : newFeatures.connectMethodsOrder

      // Define and set new internal value with the order
      const newInternalValue = { ...newAppKitValue, connectMethodsOrder: order }
      urlStateUtils.updateURLWithState({ features: newInternalValue })

      return newInternalValue
    })
  }

  function updateRemoteFeatures(newRemoteFeatures: Partial<RemoteFeatures>) {
    setRemoteFeatures(prev => {
      const newAppKitValue = { ...prev, ...newRemoteFeatures }

      appKit?.updateRemoteFeatures(newAppKitValue)

      urlStateUtils.updateURLWithState({ remoteFeatures: newAppKitValue })

      return newAppKitValue
    })
  }

  function updateEnableWallets(enabled: boolean) {
    setShouldEnableWallets(() => {
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
    if (enabled && !Array.isArray(appKit?.remoteFeatures.socials)) {
      updateRemoteFeatures({ socials: ConstantsUtil.DEFAULT_SOCIALS })
    } else if (!enabled) {
      updateRemoteFeatures({ socials: false })
    }
  }

  function setThemeStoreVariables(variables: ThemeVariables) {
    ThemeStore.setAccentColor(variables['--w3m-accent'] || '')
    ThemeStore.setMixColor(variables['--w3m-color-mix'] || '')
    ThemeStore.setMixColorStrength(variables['--w3m-color-mix-strength'] || 0)
    ThemeStore.setBorderRadius(variables['--w3m-border-radius-master'] || '2px')
    ThemeStore.setFontFamily(variables['--w3m-font-family'] || inter.style.fontFamily)
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
    if (isInitialized) {
      const connectMethodsOrder = appKit?.getConnectMethodsOrder()
      const order = connectMethodsOrder
      updateFeatures({ connectMethodsOrder: order })
    }
  }, [isInitialized])

  useEffect(() => {
    appKit?.setThemeMode(theme as ThemeMode)
  }, [])

  const isSocialsEnabled = Array.isArray(appKit?.remoteFeatures.socials)

  return (
    <AppKitContext.Provider
      value={{
        config: {
          features,
          remoteFeatures,
          enableWallets: shouldEnableWallets,
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
        enabledChains,
        disableChain,
        enableChain,
        enabledNetworks,
        removeNetwork,
        addNetwork,
        socialsEnabled: isSocialsEnabled,
        enableWallets: shouldEnableWallets,
        isDraggingByKey,
        updateFeatures,
        updateRemoteFeatures,
        updateThemeMode,
        updateSocials,
        updateUrls,
        updateEnableWallets,
        setEnableWallets: updateEnableWallets,
        setSocialsOrder: appKit?.setSocialsOrder,
        updateDraggingState,
        resetConfigs,
        getEnabledNetworksInNamespace
      }}
    >
      <Toaster theme={theme as ThemeMode} />
      {children}
    </AppKitContext.Provider>
  )
}
