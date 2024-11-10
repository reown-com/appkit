'use client'

import { ReactNode, useEffect, useMemo, useState, createContext } from 'react'
import { createAppKit, ThemeVariables, type AppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { type AppKitNetwork, mainnet, polygon } from '@reown/appkit/networks'
import { useAppKit } from '../contexts/AppKitContext'
import { ThemeStore } from '../lib/ThemeStore'

const networks = [mainnet, polygon] as [AppKitNetwork, ...AppKitNetwork[]]

const ethersAdapter = new EthersAdapter()

interface AppKitProviderProps {
  children: ReactNode
}

let kit: undefined | AppKit = undefined

export const AppKitContext = createContext({
  themeMode: 'light',
  setThemeMode: () => {},
  isDrawerOpen: false,
  setIsDrawerOpen: () => {}
})

export default function AppKitProvider({ children }: AppKitProviderProps) {
  const { themeMode, features, isLoading } = useAppKit()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    kit?.setThemeMode(themeMode)
    kit?.updateFeatures(features)
  }, [themeMode, features])

  useEffect(() => {
    if (!isLoading) {
      kit = createAppKit({
        adapters: [ethersAdapter],
        networks,
        defaultNetwork: mainnet,
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
        disableAppend: true,
        features,
        themeMode
      })
      ThemeStore.setModal({
        setThemeVariables: (variables: ThemeVariables) => {
          console.log('Setting theme variables:', variables)
          kit?.setThemeVariables(variables)
        }
      })
      console.log('AppKit initialized with theme:', themeMode)
    }
  }, [isLoading])

  return (
    <AppKitContext.Provider
      value={{
        themeMode,
        setThemeMode: (mode: string) => {
          kit?.setThemeMode(mode)
          console.log('Theme mode updated:', mode)
        },
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}
