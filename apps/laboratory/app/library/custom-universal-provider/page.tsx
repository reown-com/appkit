'use client'

import { useEffect, useState } from 'react'

import Provider, { UniversalProvider } from '@walletconnect/universal-provider'

import { mainnet } from '@reown/appkit/networks'
import { AppKit, createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { MultiChainInfo } from '@/src/components/MultiChainInfo'
import { UpaTests } from '@/src/components/UPA/UpaTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = ConstantsUtil.AllNetworks

export default function MultiChainWagmiAdapterOnly() {
  const [uprovider, setUprovider] = useState<Provider | null>(null)
  const [appkit, setAppKit] = useState<AppKit | null>(null)

  async function initializeUniversalProvider() {
    const provider = await UniversalProvider.init({
      projectId: ConstantsUtil.ProjectId
    })

    const modal = createAppKit({
      networks,
      defaultNetwork: mainnet,
      projectId: ConstantsUtil.ProjectId,
      metadata: ConstantsUtil.Metadata,
      universalProvider: provider
    })

    ThemeStore.setModal(modal)
    setAppKit(modal)

    provider.on('display_uri', () => {
      modal.open({ view: 'ConnectingWalletConnectBasic' })
    })

    setUprovider(provider)
  }

  useEffect(() => {
    initializeUniversalProvider()
  }, [])

  return (
    <InitializeBoundary>
      {uprovider && appkit ? (
        <>
          <AppKitButtons />
          <MultiChainInfo />
          <UpaTests />
        </>
      ) : (
        ''
      )}
    </InitializeBoundary>
  )
}
