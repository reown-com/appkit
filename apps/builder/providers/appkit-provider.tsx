'use client'

import { ReactNode, useEffect, useMemo } from 'react'
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

export default function AppKitProvider({ children }: AppKitProviderProps) {
  const { themeMode, themeVariables, features, isLoading } = useAppKit()

  useEffect(() => {
    kit?.setThemeMode(themeMode)
    kit?.setThemeVariables(themeVariables)
    console.log('set features', features)
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
        features
      })
    }
  }, [isLoading])

  return <>{children}</>
}
