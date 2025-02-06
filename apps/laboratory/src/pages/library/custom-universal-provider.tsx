import { useEffect, useState } from 'react'

import Provider, { UniversalProvider } from '@walletconnect/universal-provider'

import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'
import { AppKit, createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { UpaTests } from '../../components/UPA/UpaTests'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const networks = [...ConstantsUtil.AllNetworks, ...ConstantsUtil.BitcoinNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

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
    <>
      {uprovider && appkit ? (
        <>
          <AppKitButtons />
          <MultiChainInfo />
          <UpaTests />
        </>
      ) : (
        ''
      )}
    </>
  )
}
