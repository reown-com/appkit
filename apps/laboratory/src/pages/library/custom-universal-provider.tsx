import { AppKit, createAppKit } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { mainnet } from '@reown/appkit/networks'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { UpaTests } from '../../components/UPA/UpaTests'
import Provider, { UniversalProvider } from '@walletconnect/universal-provider'
import { useEffect, useState } from 'react'

const networks = ConstantsUtil.EvmNetworks

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

    provider.on('display_uri', (connection: string) => {
      modal.open({ view: 'ConnectingWalletConnectBasic', uri: connection })
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
