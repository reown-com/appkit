'use client'

import { ReactNode, useEffect, useMemo, useState, createContext } from 'react'
import { createAppKit, type AppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { type AppKitNetwork, mainnet, polygon } from '@reown/appkit/networks'
import { useAppKit } from '../contexts/AppKitContext'

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
  const { themeMode, themeVariables, features, isLoading } = useAppKit()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    kit?.setThemeMode(themeMode)
    kit?.setThemeVariables(themeVariables)
    kit?.updateFeatures(features)
  }, [themeMode, themeVariables, features])

  useEffect(() => {
    if (!isLoading) {
      kit = createAppKit({
        adapters: [ethersAdapter],
        networks,
        defaultNetwork: mainnet,
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
        disableAppend: true,
        features,
        themeMode,
        themeVariables
      })
    }
  }, [isLoading])

  return (
    <AppKitContext.Provider
      value={{
        themeMode,
        setThemeMode: (mode: string) => kit?.setThemeMode(mode),
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}
