'use client'

import { createContext } from 'react'

import { type UniqueIdentifier } from '@dnd-kit/core'

import type { AppKitNetwork, ChainNamespace } from '@reown/appkit-common'
import type { Features, SocialProvider, ThemeMode } from '@reown/appkit-controllers'

import { type NetworkOption } from '@/lib/networks'
import { type URLState } from '@/lib/url-state'

interface AppKitContextType {
  config: URLState
  enableWallets: boolean
  enabledNetworks: (string | number)[]
  socialsEnabled: boolean
  isDraggingByKey: Record<string, boolean>
  enabledChains: ChainNamespace[]
  disableChain: (chain: ChainNamespace) => void
  enableChain: (chain: ChainNamespace, network: AppKitNetwork | undefined) => void
  removeNetwork: (network: NetworkOption) => void
  addNetwork: (network: NetworkOption) => void
  updateThemeMode: (mode: ThemeMode) => void
  updateFeatures: (features: Partial<Features>) => void
  updateSocials: (enabled: boolean) => void
  updateEnableWallets: (enabled: boolean) => void
  updateUrls: (urls: { termsConditions?: string; privacyPolicy?: string }) => void
  setEnableWallets: (enabled: boolean) => void
  setSocialsOrder: ((order: SocialProvider[]) => void) | undefined
  updateDraggingState: (key: UniqueIdentifier, dragging: boolean) => void
  resetConfigs: () => void
  getEnabledNetworksInNamespace: (namespace: ChainNamespace) => (string | number)[]
}

export const AppKitContext = createContext<AppKitContextType | undefined>(undefined)
